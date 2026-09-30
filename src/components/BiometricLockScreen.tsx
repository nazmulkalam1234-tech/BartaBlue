import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ScanFace,
  Lock,
  Unlock,
  ShieldCheck,
  Delete,
  Sparkles,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface BiometricLockScreenProps {
  onUnlock: () => void;
  correctPin?: string;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  onUnlock,
  correctPin = '1234',
}) => {
  const [pin, setPin] = useState<string>('');
  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Trigger simulated biometric scan
  const triggerBiometricScan = () => {
    setIsScanning(true);
    setErrorMsg(null);

    // Simulate hardware biometric scanning delay
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      soundEffects.playSendSound();
      setTimeout(() => {
        onUnlock();
      }, 500);
    }, 1100);
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg(null);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setIsSuccess(true);
          soundEffects.playSendSound();
          setTimeout(() => {
            onUnlock();
          }, 400);
        } else {
          setErrorMsg('Incorrect PIN. Try 1234 or use Biometrics');
          soundEffects.playCallEndTone();
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Glow ambient gradients */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon Header */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-600/40">
            {isSuccess ? (
              <Unlock size={32} className="animate-bounce text-white" />
            ) : (
              <Lock size={30} className="text-white" />
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full border-2 border-slate-900">
            <ShieldCheck size={12} />
          </span>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          BartaBlue Locked
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          End-to-End Encrypted Session Protected
        </p>

        {/* Biometric Scan Mode */}
        {authMode === 'biometric' ? (
          <div className="w-full flex flex-col items-center space-y-6">
            <div
              onClick={triggerBiometricScan}
              className={`relative cursor-pointer group p-6 rounded-3xl border transition-all ${
                isScanning
                  ? 'bg-blue-600/20 border-blue-400 scale-105 shadow-2xl shadow-blue-500/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-blue-500/60 hover:bg-slate-950'
              }`}
            >
              {/* Pulsing ring during scan */}
              {isScanning && (
                <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none" />
              )}

              <Fingerprint
                size={72}
                className={`transition-colors duration-300 ${
                  isScanning
                    ? 'text-cyan-400 animate-pulse'
                    : isSuccess
                    ? 'text-emerald-400'
                    : 'text-blue-500 group-hover:text-blue-400'
                }`}
              />

              {/* Scanning laser line overlay */}
              {isScanning && (
                <div className="absolute inset-x-3 top-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce rounded-full" />
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={triggerBiometricScan}
                disabled={isScanning}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 text-xs transition-all flex items-center gap-2 mx-auto"
              >
                <ScanFace size={16} />
                <span>{isScanning ? 'Authenticating...' : 'Touch to Unlock (Face / Touch ID)'}</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                Click sensor to simulate biometric verification
              </p>
            </div>

            {/* Switch to PIN */}
            <button
              type="button"
              onClick={() => setAuthMode('pin')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors pt-2"
            >
              <KeyRound size={14} />
              <span>Use 4-Digit Security PIN instead</span>
            </button>
          </div>
        ) : (
          /* PIN Keypad Mode */
          <div className="w-full flex flex-col items-center space-y-4">
            {/* PIN Dots */}
            <div className="flex items-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      filled
                        ? isSuccess
                          ? 'bg-emerald-400 scale-125'
                          : 'bg-blue-500 scale-110 shadow-md shadow-blue-500/50'
                        : 'border-2 border-slate-700 bg-slate-950'
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> {errorMsg}
              </p>
            )}

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  onClick={() => handleKeyPress(n)}
                  className="h-12 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-white font-bold text-lg border border-slate-800/90 active:scale-95 transition-all shadow-sm"
                >
                  {n}
                </button>
              ))}

              {/* Biometric Switch Button */}
              <button
                onClick={() => setAuthMode('biometric')}
                className="h-12 rounded-2xl bg-slate-950/40 hover:bg-slate-800 text-blue-400 flex items-center justify-center border border-slate-800 active:scale-95 transition-all"
                title="Switch back to Biometrics"
              >
                <Fingerprint size={20} />
              </button>

              {/* 0 Key */}
              <button
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-white font-bold text-lg border border-slate-800/90 active:scale-95 transition-all shadow-sm"
              >
                0
              </button>

              {/* Delete / Backspace */}
              <button
                onClick={handleDelete}
                className="h-12 rounded-2xl bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 active:scale-95 transition-all"
                title="Delete"
              >
                <Delete size={20} />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono pt-1">
              Default demo PIN: <span className="text-slate-300 font-bold">1234</span>
            </p>
          </div>
        )}

        {/* Security Footer Seal */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Protected by Secure Enclave & Curve25519</span>
        </div>
      </div>
    </div>
  );
};
