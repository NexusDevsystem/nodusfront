
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { integrationService } from '../services/integrationService';
import { apiClient } from '../services/apiClient';
import { Loader2 } from 'lucide-react';

export default function IntegrationCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { profile, loading } = useAuth();
    const [status, setStatus] = useState('Processando...');

    useEffect(() => {
        const handleCallback = async () => {
            if (loading) return;
            if (!profile?.id) {
                setStatus('Erro: Usuário não autenticado.');
                return;
            }

            const code = searchParams.get('code');
            const error = searchParams.get('error');

            if (error) {
                setStatus(`Erro na autorização: ${error}`);
                setTimeout(() => navigate('/admin'), 3000);
                return;
            }

            if (!code) {
                setStatus('Código de autorização não encontrado.');
                setTimeout(() => navigate('/admin'), 3000);
                return;
            }

            try {
                setStatus('Conectando conta...');
                const { integration } = await integrationService.connectYouTube(code, profile.id);

                // Create a verified link automatically
                setStatus('Criando link verificado...');
                const { profile_data } = integration;

                if (profile_data) {
                    await apiClient.post('/links', {
                        title: 'YouTube',
                        // Create deep link to channel or just use standard URL
                        url: `https://youtube.com/channel/${profile_data.channel_id}`,
                        subtitle: `${(profile_data.follower_count || 0).toLocaleString()} Subscribers`,
                        icon: 'youtube',
                        layout: 'classic',
                        isActive: true
                    });
                    setStatus('Link verificado criado com sucesso!');
                }

                setTimeout(() => navigate('/admin'), 1500);
            } catch (err: any) {
                console.error(err);
                setStatus(`Falha na conexão: ${err.message || 'Erro desconhecido'}`);
                setTimeout(() => navigate('/admin'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, profile, loading, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-md w-full">
                <Loader2 size={48} className="text-brand-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Integração Social</h2>
                <p className="text-slate-600">{status}</p>
            </div>
        </div>
    );
}
