
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Voltar para Nodus</span>
                    </Link>
                    <div className="font-bold text-xl tracking-tight text-slate-900">Nodus.cc</div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Política de Privacidade</h1>
                <p className="text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="prose prose-slate max-w-none">
                    <p>
                        A sua privacidade é importante para nós. É política do Nodus respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site <a href="https://noduscc.com.br">Nodus.cc</a>, e outros sites que possuímos e operamos.
                    </p>

                    <h3>1. Informações que coletamos</h3>
                    <p>
                        Coletamos informações pessoais que você nos fornece voluntariamente ao se registrar no Nodus, como seu nome, endereço de e-mail e foto de perfil.
                        Além disso, quando você utiliza nossos serviços de integração com terceiros (como Google/YouTube), coletamos as informações necessárias para fornecer a funcionalidade solicitada, conforme descrito abaixo.
                    </p>

                    <h3>2. Uso de Dados do Google (YouTube)</h3>
                    <p>
                        O Nodus utiliza serviços de API do YouTube para permitir que você exiba estatísticas do seu canal (como contagem de inscritos) em seu perfil.
                        Ao conectar sua conta do YouTube, acessamos:
                    </p>
                    <ul>
                        <li><strong>Informações do Canal:</strong> Título, descrição, ID do canal e contagem de inscritos.</li>
                        <li><strong>Estatísticas Básicas:</strong> Apenas dados públicos para exibição no seu cartão de perfil.</li>
                    </ul>
                    <p>
                        <strong>Não armazenamos</strong> dados sensíveis além dos tokens de acesso necessários para manter a conexão ativa.
                        O Nodus <strong>não compartilha</strong> seus dados do Google com terceiros, exceto conforme necessário para fornecer o serviço (por exemplo, exibir seus inscritos publicamente no seu perfil Nodus, conforme sua configuração).
                    </p>
                    <p>
                        O uso das informações recebidas das APIs do Google pelo Nodus adere à <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Política de Dados do Usuário dos Serviços de API do Google</a>, incluindo os requisitos de uso limitado.
                    </p>

                    <h3>3. Como usamos suas informações</h3>
                    <p>
                        Usamos suas informações para:
                    </p>
                    <ul>
                        <li>Fornecer, operar e manter nosso site;</li>
                        <li>Melhorar, personalizar e expandir nosso site;</li>
                        <li>Entender e analisar como você usa nosso site;</li>
                        <li>Desenvolver novos produtos, serviços, recursos e funcionalidades;</li>
                        <li>Comunicar com você, diretamente ou através de um dos nossos parceiros, incluindo para atendimento ao cliente, para fornecer atualizações e outras informações relacionadas ao site, e para fins de marketing e promoção;</li>
                        <li>Enviar-lhe e-mails;</li>
                        <li>Encontrar e prevenir fraudes.</li>
                    </ul>

                    <h3>4. Segurança</h3>
                    <p>
                        Valorizamos sua confiança em nos fornecer suas Informações Pessoais, portanto, estamos nos esforçando para usar meios comercialmente aceitáveis de protegê-las. Mas lembre-se que nenhum método de transmissão pela internet ou método de armazenamento eletrônico é 100% seguro e confiável, e não podemos garantir sua segurança absoluta.
                    </p>

                    <h3>5. Cookies</h3>
                    <p>
                        O Nodus usa cookies para armazenar informações sobre preferências dos visitantes, para registrar informações específicas do usuário sobre as páginas que o visitante acessa ou visita, e para personalizar ou customizar o conteúdo da nossa página web com base no tipo de navegador dos visitantes ou outras informações que o visitante envia através do seu navegador.
                    </p>

                    <h3>6. Links para Outros Sites</h3>
                    <p>
                        Nosso Serviço pode conter links para outros sites que não são operados por nós. Se você clicar em um link de terceiros, você será direcionado para o site desse terceiro. Aconselhamos veementemente que reveja a Política de Privacidade de cada site que visita.
                    </p>

                    <h3>7. Contato</h3>
                    <p>
                        Se você tiver alguma dúvida ou sugestão sobre nossa Política de Privacidade, não hesite em nos contatar em <a href="mailto:contato@noduscc.com.br">contato@noduscc.com.br</a>.
                    </p>
                </div>
            </main>
        </div>
    );
}
