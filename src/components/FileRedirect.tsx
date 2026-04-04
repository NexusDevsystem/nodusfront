import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../services/apiClient';

const FileRedirect = () => {
    const params = useParams();
    const filename = params['*'];
    const { t } = useTranslation();

    useEffect(() => {
        if (filename) {
            window.location.href = `${API_URL}/arquivo/${filename}`;
        }
    }, [filename, API_URL]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-4 border-black border-t-[#ffdf00] rounded-full animate-spin mb-4" />
            <h1 className="text-xs font-black uppercase tracking-[0.2em]">{t('common.loading') || 'Carregando Arquivo...'}</h1>
        </div>
    );
};

export default FileRedirect;
