
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
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
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Termos de Uso</h1>
                <p className="text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="prose prose-slate max-w-none">
                    <h3>1. Termos</h3>
                    <p>
                        Ao acessar o site <a href="https://noduscc.com.br">Nodus</a>, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
                    </p>

                    <h3>2. Uso de Licença</h3>
                    <p>
                        É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Nodus, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
                    </p>
                    <ul>
                        <li>modificar ou copiar os materiais;</li>
                        <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
                        <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Nodus;</li>
                        <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
                        <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
                    </ul>
                    <p>
                        Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida pelo Nodus a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrônico ou impresso.
                    </p>

                    <h3>3. Isenção de responsabilidade</h3>
                    <p>
                        Os materiais no site da Nodus são fornecidos 'como estão'. Nodus não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                    </p>
                    <p>
                        Além disso, o Nodus não garante ou faz qualquer representação relativa à precisão, aos resultados prováveis ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.
                    </p>

                    <h3>4. Limitações</h3>
                    <p>
                        Em nenhum caso o Nodus ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Nodus, mesmo que Nodus ou um representante autorizado da Nodus tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos conseqüentes ou incidentais, essas limitações podem não se aplicar a você.
                    </p>

                    <h3>5. Precisão dos materiais</h3>
                    <p>
                        Os materiais exibidos no site da Nodus podem incluir erros técnicos, tipográficos ou fotográficos. Nodus não garante que qualquer material em seu site seja preciso, completo ou atual. Nodus pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, Nodus não se compromete a atualizar os materiais.
                    </p>

                    <h3>6. Links</h3>
                    <p>
                        O Nodus não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por Nodus do site. O uso de qualquer site vinculado é por conta e risco do usuário.
                    </p>

                    <h3>Modificações</h3>
                    <p>
                        O Nodus pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
                    </p>

                    <h3>Lei aplicável</h3>
                    <p>
                        Estes termos e condições são regidos e interpretados de acordo com as leis do Nodus e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
                    </p>
                </div>
            </main>
        </div>
    );
}
