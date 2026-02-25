import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Upload, Camera, X, User, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

interface ProfileEditorProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: string | boolean | undefined) => {
    onChange({ ...profile, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange('avatarUrl', reader.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    handleChange('avatarUrl', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="p-6">

        {/* Avatar Section - Compact & Minimal */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`}
                alt="Avatar"
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`;
                }}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*, image/gif"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-sm font-medium text-slate-800">Foto de Perfil</div>
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-600 font-medium hover:text-brand-700"
              >
                Alterar
              </button>
              <button
                onClick={handleRemoveImage}
                className="text-slate-400 hover:text-red-500"
              >
                Remover
              </button>
            </div>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="space-y-5">

          {/* Name Field */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="@seunome"
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Biografia
            </label>

            <div className="relative">
              <textarea
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                maxLength={80}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm leading-relaxed placeholder:text-slate-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                placeholder="Escreva algo sobre você..."
              />
              <div className={`absolute bottom-2 right-2 text-[9px] ${profile.bio.length >= 80 ? 'text-red-500' : 'text-slate-300'}`}>
                {profile.bio.length}/80
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;