import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

class ThreeScene {
    #config;
    canvas: HTMLCanvasElement;
    camera: THREE.PerspectiveCamera;
    cameraMinAspect?: number;
    cameraMaxAspect?: number;
    cameraFov: number;
    maxPixelRatio?: number;
    minPixelRatio?: number;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    #postprocessing: any;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    render = this.#internalRender;
    onBeforeRender = (time: { elapsed: number; delta: number }) => { };
    onAfterRender = (time: { elapsed: number; delta: number }) => { };
    onAfterResize = (size: any) => { };
    #isIntersecting = false;
    #isRunning = false;
    isDisposed = false;
    #intersectionObserver?: IntersectionObserver;
    #resizeObserver?: ResizeObserver;
    #resizeTimeout: any;
    #clock = new THREE.Clock();
    #time = { elapsed: 0, delta: 0 };
    #requestAnimationFrameId: any;

    constructor(options: any) {
        this.#config = { ...options };
        this.#initCamera();
        this.#initScene();
        this.#initRenderer();
        this.resize();
        this.#initEvents();
    }

    #initCamera() {
        this.camera = new THREE.PerspectiveCamera();
        this.cameraFov = this.camera.fov;
    }

    #initScene() {
        this.scene = new THREE.Scene();
    }

    #initRenderer() {
        if (this.#config.canvas) {
            this.canvas = this.#config.canvas;
        } else {
            console.error('Three: Missing canvas parameter');
        }
        this.canvas.style.display = 'block';
        const options = {
            canvas: this.canvas,
            powerPreference: 'high-performance',
            ...(this.#config.rendererOptions ?? {})
        };
        this.renderer = new THREE.WebGLRenderer(options);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    #initEvents() {
        if (!(this.#config.size instanceof Object)) {
            window.addEventListener('resize', this.#handleResize.bind(this));
            if (this.#config.size === 'parent' && this.canvas.parentNode) {
                this.#resizeObserver = new ResizeObserver(this.#handleResize.bind(this));
                this.#resizeObserver.observe(this.canvas.parentNode as Element);
            }
        }
        this.#intersectionObserver = new IntersectionObserver(this.#handleIntersection.bind(this), {
            root: null,
            rootMargin: '0px',
            threshold: 0
        });
        this.#intersectionObserver.observe(this.canvas);
        document.addEventListener('visibilitychange', this.#handleVisibilityChange.bind(this));
    }

    #removeEvents() {
        window.removeEventListener('resize', this.#handleResize.bind(this));
        this.#resizeObserver?.disconnect();
        this.#intersectionObserver?.disconnect();
        document.removeEventListener('visibilitychange', this.#handleVisibilityChange.bind(this));
    }

    #handleIntersection(entries: IntersectionObserverEntry[]) {
        this.#isIntersecting = entries[0].isIntersecting;
        this.#isIntersecting ? this.#start() : this.#stop();
    }

    #handleVisibilityChange() {
        if (this.#isIntersecting) {
            document.hidden ? this.#stop() : this.#start();
        }
    }

    #handleResize() {
        if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
        this.#resizeTimeout = setTimeout(this.resize.bind(this), 100);
    }

    resize() {
        let width, height;
        if (this.#config.size instanceof Object) {
            width = this.#config.size.width;
            height = this.#config.size.height;
        } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
            width = (this.canvas.parentNode as HTMLElement).offsetWidth;
            height = (this.canvas.parentNode as HTMLElement).offsetHeight;
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }
        this.size.width = width;
        this.size.height = height;
        this.size.ratio = width / height;
        this.#updateCamera();
        this.#updateRendererSize();
        this.onAfterResize(this.size);
    }

    #updateCamera() {
        this.camera.aspect = this.size.width / this.size.height;
        if (this.camera.isPerspectiveCamera && this.cameraFov) {
            if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
                this.#updateFov(this.cameraMinAspect);
            } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
                this.#updateFov(this.cameraMaxAspect);
            } else {
                this.camera.fov = this.cameraFov;
            }
        }
        this.camera.updateProjectionMatrix();
        this.updateWorldSize();
    }

    #updateFov(aspect: number) {
        const fov = 2 * THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / aspect)));
        this.camera.fov = fov;
    }

    updateWorldSize() {
        if (this.camera.isPerspectiveCamera) {
            const fov = (this.camera.fov * Math.PI) / 180;
            this.size.wHeight = 2 * Math.tan(fov / 2) * this.camera.position.length();
            this.size.wWidth = this.size.wHeight * this.camera.aspect;
        }
    }

    #updateRendererSize() {
        this.renderer.setSize(this.size.width, this.size.height);
        this.#postprocessing?.setSize(this.size.width, this.size.height);
        let pixelRatio = window.devicePixelRatio;
        if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
            pixelRatio = this.maxPixelRatio;
        } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
            pixelRatio = this.minPixelRatio;
        }
        this.renderer.setPixelRatio(pixelRatio);
        this.size.pixelRatio = pixelRatio;
    }

    get postprocessing() {
        return this.#postprocessing;
    }

    set postprocessing(val: any) {
        this.#postprocessing = val;
        this.render = val.render.bind(val);
    }

    #start() {
        if (this.#isRunning) return;
        const animate = () => {
            this.#requestAnimationFrameId = requestAnimationFrame(animate);
            this.#time.delta = this.#clock.getDelta();
            this.#time.elapsed += this.#time.delta;
            this.onBeforeRender(this.#time);
            this.render();
            this.onAfterRender(this.#time);
        };
        this.#isRunning = true;
        this.#clock.start();
        animate();
    }

    #stop() {
        if (this.#isRunning) {
            cancelAnimationFrame(this.#requestAnimationFrameId);
            this.#isRunning = false;
            this.#clock.stop();
        }
    }

    #internalRender() {
        this.renderer.render(this.scene, this.camera);
    }

    clear() {
        this.scene.traverse((obj: any) => {
            if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
                Object.keys(obj.material).forEach(key => {
                    const val = obj.material[key];
                    if (val !== null && typeof val === 'object' && typeof val.dispose === 'function') {
                        val.dispose();
                    }
                });
                obj.material.dispose();
                obj.geometry.dispose();
            }
        });
        this.scene.clear();
    }

    dispose() {
        this.#removeEvents();
        this.#stop();
        this.clear();
        this.#postprocessing?.dispose();
        this.renderer.dispose();
        this.isDisposed = true;
    }
}

const interactions = new Map<HTMLElement, any>();
const currentPointer = new THREE.Vector2();
let isInteracting = false;

function setupInteraction(options: any) {
    const interaction = {
        position: new THREE.Vector2(),
        nPosition: new THREE.Vector2(),
        hover: false,
        touching: false,
        onEnter: () => { },
        onMove: () => { },
        onClick: () => { },
        onLeave: () => { },
        ...options
    };

    if (!interactions.has(options.domElement)) {
        interactions.set(options.domElement, interaction);
        if (!isInteracting) {
            document.body.addEventListener('pointermove', handlePointerMove);
            document.body.addEventListener('pointerleave', handlePointerLeave);
            document.body.addEventListener('click', handlePointerClick);
            document.body.addEventListener('touchstart', handleTouchStart, { passive: false });
            document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.body.addEventListener('touchend', handleTouchEnd, { passive: false });
            document.body.addEventListener('touchcancel', handleTouchEnd, { passive: false });
            isInteracting = true;
        }
    }

    interaction.dispose = () => {
        interactions.delete(options.domElement);
        if (interactions.size === 0) {
            document.body.removeEventListener('pointermove', handlePointerMove);
            document.body.removeEventListener('pointerleave', handlePointerLeave);
            document.body.removeEventListener('click', handlePointerClick);
            document.body.removeEventListener('touchstart', handleTouchStart);
            document.body.removeEventListener('touchmove', handleTouchMove);
            document.body.removeEventListener('touchend', handleTouchEnd);
            document.body.removeEventListener('touchcancel', handleTouchEnd);
            isInteracting = false;
        }
    };
    return interaction;
}

function handlePointerMove(e: PointerEvent) {
    currentPointer.x = e.clientX;
    currentPointer.y = e.clientY;
    processInteractions();
}

function processInteractions() {
    for (const [elem, interaction] of interactions) {
        const rect = elem.getBoundingClientRect();
        if (isInside(rect)) {
            updateInteractionPosition(interaction, rect);
            if (!interaction.hover) {
                interaction.hover = true;
                interaction.onEnter(interaction);
            }
            interaction.onMove(interaction);
        } else if (interaction.hover && !interaction.touching) {
            interaction.hover = false;
            interaction.onLeave(interaction);
        }
    }
}

function handlePointerClick(e: PointerEvent) {
    currentPointer.x = e.clientX;
    currentPointer.y = e.clientY;
    for (const [elem, interaction] of interactions) {
        const rect = elem.getBoundingClientRect();
        updateInteractionPosition(interaction, rect);
        if (isInside(rect)) interaction.onClick(interaction);
    }
}

function handlePointerLeave() {
    for (const interaction of interactions.values()) {
        if (interaction.hover) {
            interaction.hover = false;
            interaction.onLeave(interaction);
        }
    }
}

function handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
        e.preventDefault();
        currentPointer.x = e.touches[0].clientX;
        currentPointer.y = e.touches[0].clientY;
        for (const [elem, interaction] of interactions) {
            const rect = elem.getBoundingClientRect();
            if (isInside(rect)) {
                interaction.touching = true;
                updateInteractionPosition(interaction, rect);
                if (!interaction.hover) {
                    interaction.hover = true;
                    interaction.onEnter(interaction);
                }
                interaction.onMove(interaction);
            }
        }
    }
}

function handleTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
        e.preventDefault();
        currentPointer.x = e.touches[0].clientX;
        currentPointer.y = e.touches[0].clientY;
        for (const [elem, interaction] of interactions) {
            const rect = elem.getBoundingClientRect();
            updateInteractionPosition(interaction, rect);
            if (isInside(rect)) {
                if (!interaction.hover) {
                    interaction.hover = true;
                    interaction.touching = true;
                    interaction.onEnter(interaction);
                }
                interaction.onMove(interaction);
            } else if (interaction.hover && interaction.touching) {
                interaction.onMove(interaction);
            }
        }
    }
}

function handleTouchEnd() {
    for (const interaction of interactions.values()) {
        if (interaction.touching) {
            interaction.touching = false;
            if (interaction.hover) {
                interaction.hover = false;
                interaction.onLeave(interaction);
            }
        }
    }
}

function updateInteractionPosition(interaction: any, rect: DOMRect) {
    interaction.position.x = currentPointer.x - rect.left;
    interaction.position.y = currentPointer.y - rect.top;
    interaction.nPosition.x = (interaction.position.x / rect.width) * 2 - 1;
    interaction.nPosition.y = (-interaction.position.y / rect.height) * 2 + 1;
}

function isInside(rect: DOMRect) {
    return currentPointer.x >= rect.left && currentPointer.x <= rect.right && currentPointer.y >= rect.top && currentPointer.y <= rect.bottom;
}

const tempVec3_1 = new THREE.Vector3();
const tempVec3_2 = new THREE.Vector3();
const tempVec3_3 = new THREE.Vector3();
const tempVec3_4 = new THREE.Vector3();
const tempVec3_5 = new THREE.Vector3();
const tempVec3_6 = new THREE.Vector3();
const tempVec3_7 = new THREE.Vector3();
const tempVec3_8 = new THREE.Vector3();
const tempVec3_9 = new THREE.Vector3();
const tempVec3_10 = new THREE.Vector3();

class PhysicsWorld {
    config: any;
    positionData: Float32Array;
    velocityData: Float32Array;
    sizeData: Float32Array;
    center = new THREE.Vector3();
    gravityVector = new THREE.Vector3(0, -1, 0); // Default gravity down

    constructor(config: any) {
        this.config = config;
        this.positionData = new Float32Array(3 * config.count).fill(0);
        this.velocityData = new Float32Array(3 * config.count).fill(0);
        this.sizeData = new Float32Array(config.count).fill(1);
        this.#initPositions();
        this.setSizes();
    }

    #initPositions() {
        this.center.toArray(this.positionData, 0);
        for (let i = 1; i < this.config.count; i++) {
            const idx = 3 * i;
            this.positionData[idx] = THREE.MathUtils.randFloatSpread(2 * this.config.maxX);
            this.positionData[idx + 1] = THREE.MathUtils.randFloatSpread(2 * this.config.maxY);
            this.positionData[idx + 2] = THREE.MathUtils.randFloatSpread(2 * this.config.maxZ);
        }
    }

    setSizes() {
        this.sizeData[0] = this.config.size0;
        for (let i = 1; i < this.config.count; i++) {
            this.sizeData[i] = THREE.MathUtils.randFloat(this.config.minSize, this.config.maxSize);
        }
    }

    update(time: { delta: number }) {
        const { config, center, positionData, sizeData, velocityData } = this;
        let startIdx = 0;
        if (config.controlSphere0) {
            startIdx = 1;
            tempVec3_1.fromArray(positionData, 0);
            tempVec3_1.lerp(center, 0.1).toArray(positionData, 0);
            tempVec3_4.set(0, 0, 0).toArray(velocityData, 0);
        }
        for (let i = startIdx; i < config.count; i++) {
            const base = 3 * i;
            tempVec3_2.fromArray(positionData, base);
            tempVec3_5.fromArray(velocityData, base);

            // Apply vector gravity
            tempVec3_5.x += time.delta * config.gravity * this.gravityVector.x * sizeData[i] * 10;
            tempVec3_5.y += time.delta * config.gravity * this.gravityVector.y * sizeData[i] * 10;

            tempVec3_5.multiplyScalar(config.friction);
            tempVec3_5.clampLength(0, config.maxVelocity);
            tempVec3_2.add(tempVec3_5);
            tempVec3_2.toArray(positionData, base);
            tempVec3_5.toArray(velocityData, base);
        }
        for (let i = startIdx; i < config.count; i++) {
            const base = 3 * i;
            tempVec3_2.fromArray(positionData, base);
            tempVec3_5.fromArray(velocityData, base);
            const radius = sizeData[i];
            for (let j = i + 1; j < config.count; j++) {
                const otherBase = 3 * j;
                tempVec3_3.fromArray(positionData, otherBase);
                tempVec3_6.fromArray(velocityData, otherBase);
                const otherRadius = sizeData[j];
                tempVec3_7.copy(tempVec3_3).sub(tempVec3_2);
                const dist = tempVec3_7.length();
                const sumRadius = radius + otherRadius;
                if (dist < sumRadius) {
                    const overlap = sumRadius - dist;
                    tempVec3_8.copy(tempVec3_7).normalize().multiplyScalar(0.5 * overlap);
                    tempVec3_9.copy(tempVec3_8).multiplyScalar(Math.max(tempVec3_5.length(), 1));
                    tempVec3_10.copy(tempVec3_8).multiplyScalar(Math.max(tempVec3_6.length(), 1));
                    tempVec3_2.sub(tempVec3_8);
                    tempVec3_5.sub(tempVec3_9);
                    tempVec3_2.toArray(positionData, base);
                    tempVec3_5.toArray(velocityData, base);
                    tempVec3_3.add(tempVec3_8);
                    tempVec3_6.add(tempVec3_10);
                    tempVec3_3.toArray(positionData, otherBase);
                    tempVec3_6.toArray(velocityData, otherBase);
                }
            }
            if (config.controlSphere0) {
                tempVec3_7.copy(tempVec3_1).sub(tempVec3_2);
                const dist = tempVec3_7.length();
                const sumRadius0 = radius + sizeData[0];
                if (dist < sumRadius0) {
                    const diff = sumRadius0 - dist;
                    tempVec3_8.copy(tempVec3_7.normalize()).multiplyScalar(diff);
                    tempVec3_9.copy(tempVec3_8).multiplyScalar(Math.max(tempVec3_5.length(), 2));
                    tempVec3_2.sub(tempVec3_8);
                    tempVec3_5.sub(tempVec3_9);
                }
            }
            if (Math.abs(tempVec3_2.x) + radius > config.maxX) {
                tempVec3_2.x = Math.sign(tempVec3_2.x) * (config.maxX - radius);
                tempVec3_5.x = -tempVec3_5.x * config.wallBounce;
            }
            if (config.gravity === 0) {
                if (Math.abs(tempVec3_2.y) + radius > config.maxY) {
                    tempVec3_2.y = Math.sign(tempVec3_2.y) * (config.maxY - radius);
                    tempVec3_5.y = -tempVec3_5.y * config.wallBounce;
                }
            } else if (tempVec3_2.y - radius < -config.maxY) {
                tempVec3_2.y = -config.maxY + radius;
                tempVec3_5.y = -tempVec3_5.y * config.wallBounce;
            }
            const maxZBoundary = Math.max(config.maxZ, config.maxSize);
            if (Math.abs(tempVec3_2.z) + radius > maxZBoundary) {
                tempVec3_2.z = Math.sign(tempVec3_2.z) * (config.maxZ - radius);
                tempVec3_5.z = -tempVec3_5.z * config.wallBounce;
            }
            tempVec3_2.toArray(positionData, base);
            tempVec3_5.toArray(velocityData, base);
        }
    }
}

class ScatteringMaterial extends THREE.MeshPhysicalMaterial {
    uniforms: any;
    onBeforeCompile2?: (shader: any) => void;

    constructor(parameters: any) {
        super(parameters);
        this.uniforms = {
            thicknessDistortion: { value: 0.1 },
            thicknessAmbient: { value: 0 },
            thicknessAttenuation: { value: 0.1 },
            thicknessPower: { value: 2 },
            thicknessScale: { value: 10 }
        };
        this.defines = { ...this.defines, USE_UV: '' };
        this.onBeforeCompile = (shader: any) => {
            Object.assign(shader.uniforms, this.uniforms);
            shader.fragmentShader = `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ${shader.fragmentShader}
      `;
            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
        `
            );
            const lightsBegin = THREE.ShaderChunk.lights_fragment_begin.replaceAll(
                'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
                `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `
            );
            shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsBegin);
            if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
        };
    }
}

const DEFAULT_CONFIG = {
    count: 100,
    colors: [0xacc8a2, 0xffffff, 0x32a800],
    ambientColor: 0xffffff,
    ambientIntensity: 1,
    lightIntensity: 200,
    materialParams: {
        metalness: 0.5,
        roughness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.15
    },
    minSize: 0.5,
    maxSize: 1,
    size0: 1,
    gravity: 0.5,
    friction: 0.9975,
    wallBounce: 0.95,
    maxVelocity: 0.15,
    maxX: 5,
    maxY: 5,
    maxZ: 2,
    controlSphere0: false,
    followCursor: true
};

const dummy = new THREE.Object3D();

class BallpitMesh extends THREE.InstancedMesh {
    config: any;
    physics: PhysicsWorld;
    ambientLight: THREE.AmbientLight;
    light: THREE.PointLight;

    constructor(renderer: THREE.WebGLRenderer, options = {}) {
        const config = { ...DEFAULT_CONFIG, ...options };
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
        const geometry = new THREE.SphereGeometry();
        const material = new ScatteringMaterial({ envMap: envTexture, ...config.materialParams });
        material.envMapRotation.x = -Math.PI / 2;
        super(geometry, material, config.count);
        this.config = config;
        this.physics = new PhysicsWorld(config);
        this.#initLights();
        this.setColors(config.colors);
    }

    #initLights() {
        this.ambientLight = new THREE.AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
        this.add(this.ambientLight);
        this.light = new THREE.PointLight(this.config.colors[0], this.config.lightIntensity);
        this.add(this.light);
    }

    setColors(colors: any[]) {
        if (Array.isArray(colors) && colors.length > 1) {
            const colorList = colors.map(c => new THREE.Color(c));
            const getColorAt = (ratio: number) => {
                const scaled = Math.max(0, Math.min(1, ratio)) * (colorList.length - 1);
                const idx = Math.floor(scaled);
                const start = colorList[idx];
                if (idx >= colorList.length - 1) return start.clone();
                const alpha = scaled - idx;
                const end = colorList[idx + 1];
                return start.clone().lerp(end, alpha);
            };
            for (let i = 0; i < this.count; i++) {
                this.setColorAt(i, getColorAt(i / this.count));
                if (i === 0) this.light.color.copy(getColorAt(i / this.count));
            }
            if (this.instanceColor) this.instanceColor.needsUpdate = true;
        }
    }

    update(time: { delta: number }) {
        this.physics.update(time);
        for (let i = 0; i < this.count; i++) {
            dummy.position.fromArray(this.physics.positionData, 3 * i);
            if (i === 0 && this.config.followCursor === false) {
                dummy.scale.setScalar(0);
            } else {
                dummy.scale.setScalar(this.physics.sizeData[i]);
            }
            dummy.updateMatrix();
            this.setMatrixAt(i, dummy.matrix);
            if (i === 0) this.light.position.copy(dummy.position);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

function createBallpit(canvas: HTMLCanvasElement, options = {}) {
    const sceneHandler = new ThreeScene({
        canvas: canvas,
        size: 'parent',
        rendererOptions: { antialias: true, alpha: true }
    });
    let ballpit: BallpitMesh;
    sceneHandler.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    sceneHandler.camera.position.set(0, 0, 20);
    sceneHandler.camera.lookAt(0, 0, 0);
    sceneHandler.cameraMaxAspect = 1.5;
    sceneHandler.resize();

    function initBallpit(config: any) {
        if (ballpit) {
            sceneHandler.clear();
            sceneHandler.scene.remove(ballpit);
        }
        ballpit = new BallpitMesh(sceneHandler.renderer, config);
        sceneHandler.scene.add(ballpit);
    }

    initBallpit(options);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    let paused = false;

    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';

    const interaction = setupInteraction({
        domElement: canvas,
        onMove: () => {
            raycaster.setFromCamera(interaction.nPosition, sceneHandler.camera);
            sceneHandler.camera.getWorldDirection(plane.normal);
            raycaster.ray.intersectPlane(plane, intersectPoint);
            ballpit.physics.center.copy(intersectPoint);
            ballpit.config.controlSphere0 = true;
        },
        onLeave: () => {
            ballpit.config.controlSphere0 = false;
        }
    });

    // Gyroscope / Device Orientation Support
    function handleOrientation(event: DeviceOrientationEvent) {
        if (event.beta === null || event.gamma === null) return;

        // beta: tilt front-to-back (X axis)
        // gamma: tilt left-to-right (Y axis)
        // Adjust for typical phone holding orientation
        const x = event.gamma / 90; // Left-right
        const y = -event.beta / 90; // Front-back (down is negative)

        ballpit.physics.gravityVector.set(x, y, 0).normalize();
    }

    if (options.gyroscope !== false && typeof window !== 'undefined') {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            // iOS 13+ requires permission
            const startGyro = () => {
                (DeviceOrientationEvent as any).requestPermission()
                    .then((permissionState: string) => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                        }
                    })
                    .catch(console.error);
                window.removeEventListener('click', startGyro);
                window.removeEventListener('touchstart', startGyro);
            };
            window.addEventListener('click', startGyro);
            window.addEventListener('touchstart', startGyro);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }

    sceneHandler.onBeforeRender = (time) => {
        if (!paused) ballpit.update(time);
    };

    sceneHandler.onAfterResize = (size) => {
        ballpit.config.maxX = size.wWidth / 2;
        ballpit.config.maxY = size.wHeight / 2;
    };

    return {
        three: sceneHandler,
        dispose: () => {
            interaction.dispose();
            sceneHandler.dispose();
        }
    };
}

const Ballpit = ({ className = '', followCursor = true, ...props }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instanceRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        instanceRef.current = createBallpit(canvasRef.current, { followCursor, ...props });
        return () => instanceRef.current?.dispose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <canvas className={`${className} w-full h-full`} ref={canvasRef} />;
};

export default Ballpit;
