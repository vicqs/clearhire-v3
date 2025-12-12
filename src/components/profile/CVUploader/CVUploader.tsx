import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';

interface CVUploaderProps {
  onParsed: (data: any) => void;
  className?: string;
}

export const CVUploader: React.FC<CVUploaderProps> = ({ onParsed, className = '' }) => {
  const { triggerHaptic } = useHapticFeedback();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      triggerHaptic('error');
      setUploadStatus('error');
      alert('Por favor sube un archivo PDF o Word (.doc, .docx)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      triggerHaptic('error');
      setUploadStatus('error');
      alert('El archivo no debe superar los 10MB');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus('idle');
    triggerHaptic('medium');

    try {
      // Simulate CV parsing (in real app, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock parsed data
      const parsedData = {
        personalInfo: {
          firstName: 'Juan',
          lastName: 'Pérez García',
          email: 'juan.perez@email.com',
          phone: '+52 55 1234 5678',
          country: 'México',
        },
        experience: [
          {
            id: `exp-${Date.now()}`,
            company: 'Tech Solutions México',
            position: 'Desarrollador Full Stack',
            startDate: '2022-01-01',
            endDate: '2024-12-01',
            description: 'Desarrollo de aplicaciones web con React, Node.js y PostgreSQL. Implementación de CI/CD con GitHub Actions.',
          },
          {
            id: `exp-${Date.now() + 1}`,
            company: 'Startup Digital',
            position: 'Desarrollador Frontend',
            startDate: '2020-06-01',
            endDate: '2021-12-31',
            description: 'Creación de interfaces de usuario con React y TypeScript.',
          },
        ],
        education: [
          {
            id: `edu-${Date.now()}`,
            institution: 'Universidad Nacional Autónoma de México',
            degree: 'Ingeniería',
            fieldOfStudy: 'Ingeniería en Sistemas',
            graduationYear: '2020',
          },
        ],
        languages: [
          { language: 'Español', proficiency: 'Nativo' as const },
          { language: 'Inglés', proficiency: 'Avanzado' as const },
        ],
        softSkills: ['Trabajo en Equipo', 'Liderazgo', 'Comunicación', 'Resolución de Problemas'],
        trade: 'Desarrollo de Software',
      };

      setUploadStatus('success');
      triggerHaptic('success');
      onParsed(parsedData);
    } catch (error) {
      setUploadStatus('error');
      triggerHaptic('error');
      console.error('Error parsing CV:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-dashed border-blue-300 dark:border-blue-700 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          ) : uploadStatus === 'success' ? (
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          ) : (
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          {isUploading ? 'Analizando CV...' : 
           uploadStatus === 'success' ? '¡CV Analizado!' :
           uploadStatus === 'error' ? 'Error al Analizar' :
           'Sube tu CV'}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {isUploading ? 'Extrayendo información de tu CV con IA' :
           uploadStatus === 'success' ? `${fileName} procesado exitosamente` :
           uploadStatus === 'error' ? 'Intenta con otro archivo' :
           'Autocompletaremos tu perfil con IA (PDF o Word, máx 10MB)'}
        </p>

        {!isUploading && uploadStatus !== 'success' && (
          <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-2 touch-target">
            <Upload className="w-5 h-5" />
            Seleccionar CV
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              ✓ Perfil autocompletado. Revisa y ajusta la información según necesites.
            </p>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          🔒 Tu CV es procesado de forma segura y no se almacena
        </p>
      </div>
    </div>
  );
};
