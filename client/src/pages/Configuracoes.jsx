import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../supabase';
import {
    obterConfig,
    salvarConfigCompleto,
    uploadFile,
    atualizarFotoUsuario
} from '../services/empresaService';
import { applyThemeColor } from '../utils/theme';
import './Configuracoes.css';

export default function Configuracoes() {
    const { usuario, refreshProfile, applyUserTheme } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [empresaConfig, setEmpresaConfig] = useState(null);

    // Profile
    const [nome, setNome] = useState('');

    // Company
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [ramoAtividade, setRamoAtividade] = useState('');

    // Password
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    // Theme
    const [corPrincipal, setCorPrincipal] = useState('#3B82F6');

    // Upload refs
    const fotoInputRef = useRef(null);
    const logoInputRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await obterConfig();
            if (res.success && res.data) {
                setEmpresaConfig(res.data);
                setNomeEmpresa(res.data.nome_empresa || '');
                setRamoAtividade(res.data.ramo_atividade || '');
                setCorPrincipal(res.data.cor_principal || '#3B82F6');
            }
            setNome(usuario?.nome || '');
        } catch (e) {
            console.error('Erro ao carregar config:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSalvarPerfil = async () => {
        if (!nome.trim()) return toast.error('Nome obrigatorio');
        setSaving(true);
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({ nome: nome.trim(), atualizado_em: new Date().toISOString() })
                .eq('id', usuario.id);
            if (error) throw error;
            await refreshProfile();
            toast.success('Perfil atualizado!');
        } catch (e) {
            toast.error('Erro ao salvar: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSalvarEmpresa = async () => {
        setSaving(true);
        try {
            const res = await salvarConfigCompleto({
                ...empresaConfig,
                nome_empresa: nomeEmpresa,
                ramo_atividade: ramoAtividade,
                cor_principal: corPrincipal,
                logo_url: empresaConfig?.logo_url || null
            });
            if (res.success) {
                setEmpresaConfig(res.data);
                toast.success('Empresa atualizada!');
            }
        } catch (e) {
            toast.error('Erro ao salvar: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAlterarSenha = async () => {
        if (novaSenha.length < 6) return toast.error('Minimo 6 caracteres');
        if (novaSenha !== confirmarSenha) return toast.error('Senhas nao conferem');
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: novaSenha });
            if (error) throw error;
            setNovaSenha('');
            setConfirmarSenha('');
            toast.success('Senha alterada!');
        } catch (e) {
            toast.error('Erro: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAplicarCor = async () => {
        setSaving(true);
        try {
            applyThemeColor(corPrincipal);
            const res = await salvarConfigCompleto({
                ...empresaConfig,
                cor_principal: corPrincipal
            });
            if (res.success) setEmpresaConfig(res.data);
            toast.success('Tema atualizado!');
        } catch (e) {
            toast.error('Erro: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUploadFoto = async (e, tipo) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `${usuario.id}/${tipo}/${Date.now()}.${ext}`;
            const res = await uploadFile(file, path);
            if (res.success) {
                if (tipo === 'profile') {
                    await atualizarFotoUsuario(res.publicUrl);
                    await refreshProfile();
                    toast.success('Foto atualizada!');
                } else {
                    await salvarConfigCompleto({
                        ...empresaConfig,
                        logo_url: res.publicUrl
                    });
                    setEmpresaConfig(prev => ({ ...prev, logo_url: res.publicUrl }));
                    toast.success('Logo atualizado!');
                }
            }
        } catch (e) {
            toast.error('Erro no upload: ' + e.message);
        } finally {
            setSaving(false);
            e.target.value = '';
        }
    };

    if (loading) {
        return (
            <div className="configuracoes-page" style={{ textAlign: 'center', paddingTop: 60 }}>
                <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
            </div>
        );
    }

    const darkColor = (() => {
        const hex = corPrincipal.replace('#', '');
        const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 40);
        const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 40);
        const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 40);
        return `rgb(${r}, ${g}, ${b})`;
    })();

    const lightColor = (() => {
        const hex = corPrincipal.replace('#', '');
        const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + 60);
        const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + 60);
        const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + 60);
        return `rgb(${r}, ${g}, ${b})`;
    })();

    return (
        <div className="configuracoes-page">
            {/* Foto de Perfil */}
            <div className="settings-card">
                <h2>Foto de Perfil</h2>
                <div className="photo-section">
                    <div className="photo-upload" onClick={() => fotoInputRef.current?.click()}>
                        {usuario?.foto_url ? (
                            <img src={usuario.foto_url} alt={usuario.nome} />
                        ) : (
                            <div className="photo-placeholder">
                                {usuario?.nome?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <div className="photo-overlay">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                    </div>
                    <div className="photo-info">
                        <p>Clique na foto para alterar</p>
                        <p style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG. Max 2MB</p>
                    </div>
                </div>
                <input ref={fotoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUploadFoto(e, 'profile')} />
            </div>

            {/* Dados Pessoais */}
            <div className="settings-card">
                <h2>Dados Pessoais</h2>
                <div className="form-group">
                    <label>Nome</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={usuario?.email || ''} disabled />
                </div>
                <div className="btn-row">
                    <button className="btn-primary" onClick={handleSalvarPerfil} disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>

            {/* Empresa */}
            <div className="settings-card">
                <h2>Empresa</h2>
                <div className="photo-section">
                    <div className="photo-upload" onClick={() => logoInputRef.current?.click()}>
                        {empresaConfig?.logo_url ? (
                            <img src={empresaConfig.logo_url} alt="Logo" style={{ borderRadius: 12 }} />
                        ) : (
                            <div className="photo-placeholder" style={{ borderRadius: 12 }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            </div>
                        )}
                        <div className="photo-overlay">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                    </div>
                    <div className="photo-info">
                        <p>Logo da empresa</p>
                    </div>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUploadFoto(e, 'logo')} />
                <div className="form-row">
                    <div className="form-group">
                        <label>Nome da Empresa</label>
                        <input type="text" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Ramo de Atividade</label>
                        <input type="text" value={ramoAtividade} onChange={e => setRamoAtividade(e.target.value)} />
                    </div>
                </div>
                <div className="btn-row">
                    <button className="btn-primary" onClick={handleSalvarEmpresa} disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>

            {/* Alterar Senha */}
            <div className="settings-card">
                <h2>Alterar Senha</h2>
                <p>Digite sua nova senha abaixo.</p>
                <div className="form-row">
                    <div className="form-group">
                        <label>Nova Senha</label>
                        <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Min. 6 caracteres" />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Senha</label>
                        <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="Repita a senha" />
                    </div>
                </div>
                <div className="btn-row">
                    <button className="btn-primary" onClick={handleAlterarSenha} disabled={saving || !novaSenha}>
                        {saving ? 'Salvando...' : 'Alterar Senha'}
                    </button>
                </div>
            </div>

            {/* Cor do Tema */}
            <div className="settings-card">
                <h2>Cor do Tema</h2>
                <p>Personalize a cor principal do sistema.</p>
                <div className="color-picker-section">
                    <input type="color" value={corPrincipal} onChange={e => setCorPrincipal(e.target.value)} />
                    <div className="color-swatches">
                        <div className="color-swatch">
                            <div className="swatch-circle" style={{ background: darkColor }} />
                            <span>Escuro</span>
                        </div>
                        <div className="color-swatch">
                            <div className="swatch-circle" style={{ background: corPrincipal }} />
                            <span>Principal</span>
                        </div>
                        <div className="color-swatch">
                            <div className="swatch-circle" style={{ background: lightColor }} />
                            <span>Claro</span>
                        </div>
                    </div>
                </div>
                <div className="btn-row">
                    <button className="btn-primary" onClick={handleAplicarCor} disabled={saving}>
                        {saving ? 'Aplicando...' : 'Aplicar Cor'}
                    </button>
                </div>
            </div>
        </div>
    );
}
