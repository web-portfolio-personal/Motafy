'use client';

import { useState, useEffect } from 'react';
import {
  FiDatabase, FiDownload, FiUpload, FiTrash2, FiAlertTriangle,
  FiCheck, FiHardDrive, FiRefreshCw
} from 'react-icons/fi';
import {
  getStorageUsage,
  exportAllData,
  importData,
  clearAllData,
  checkStorageHealth
} from '@/lib/storage';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function StorageManager({ isOpen, onClose }) {
  const [storageInfo, setStorageInfo] = useState(null);
  const [health, setHealth] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [message, setMessage] = useState(null);

  const refreshStats = () => {
    const usage = getStorageUsage();
    const healthStatus = checkStorageHealth();
    setStorageInfo(usage);
    setHealth(healthStatus);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `motafy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Datos exportados correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar datos' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importData(data);
      refreshStats();
      setMessage({ type: 'success', text: 'Datos importados correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al importar datos. Verifica el formato del archivo.' });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleClear = () => {
    const count = clearAllData();
    refreshStats();
    setShowClearConfirm(false);
    setMessage({ type: 'success', text: `Se eliminaron ${count} elementos` });
  };

  const getProgressColor = () => {
    if (!health) return 'bg-spotify-green';
    if (health.critical) return 'bg-red-500';
    if (health.warning) return 'bg-yellow-500';
    return 'bg-spotify-green';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Almacenamiento"
      size="md"
    >
      <div className="space-y-6">
        {/* Storage Usage */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <FiHardDrive className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Uso de Almacenamiento</h3>
                <p className="text-xs text-white/50">LocalStorage del navegador</p>
              </div>
            </div>
            <button
              onClick={refreshStats}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>

          {storageInfo && (
            <>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-white/70">
                  {storageInfo.usedMB} MB / {storageInfo.totalMB} MB
                </span>
                <span className={`font-medium ${
                  health?.critical ? 'text-red-400' : 
                  health?.warning ? 'text-yellow-400' : 
                  'text-spotify-green'
                }`}>
                  {storageInfo.percentage}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor()} transition-all duration-300`}
                  style={{ width: `${Math.min(parseFloat(storageInfo.percentage), 100)}%` }}
                />
              </div>

              {health?.warning && !health.critical && (
                <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                  <FiAlertTriangle className="h-4 w-4" />
                  <span>El almacenamiento está casi lleno</span>
                </div>
              )}

              {health?.critical && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                  <FiAlertTriangle className="h-4 w-4" />
                  <span>Almacenamiento crítico. Considera exportar y limpiar datos.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
          >
            <FiDownload className="h-6 w-6 text-spotify-green" />
            <span className="text-sm font-medium text-white">Exportar</span>
            <span className="text-xs text-white/50">Descargar backup</span>
          </button>

          {/* Import */}
          <label className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors cursor-pointer">
            <FiUpload className="h-6 w-6 text-blue-400" />
            <span className="text-sm font-medium text-white">Importar</span>
            <span className="text-xs text-white/50">Restaurar backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>

          {/* Clear */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-red-500/10 rounded-xl border border-white/10 hover:border-red-500/30 transition-colors"
          >
            <FiTrash2 className="h-6 w-6 text-red-400" />
            <span className="text-sm font-medium text-white">Limpiar</span>
            <span className="text-xs text-white/50">Eliminar todo</span>
          </button>
        </div>

        {/* Info */}
        <div className="text-xs text-white/40 space-y-1">
          <p>• Los datos se guardan localmente en tu navegador</p>
          <p>• El límite es aproximadamente 5MB</p>
          <p>• Exporta regularmente para evitar pérdidas de datos</p>
          <p>• El historial se limita a las últimas 50 playlists</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {message.type === 'success' ? <FiCheck className="h-4 w-4" /> : <FiAlertTriangle className="h-4 w-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Clear Confirmation */}
        {showClearConfirm && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <FiAlertTriangle className="h-5 w-5" />
              <span className="font-semibold">¿Estás seguro?</span>
            </div>
            <p className="text-sm text-white/70">
              Esto eliminará permanentemente todos tus datos: favoritos, historial, preferencias y configuración.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleClear}
              >
                Sí, eliminar todo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

