// Página de Perfil do Usuário
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Produto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import styles from './perfil.module.css';

export default function Perfil() {
  const [user, setUser] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    verificarUsuario();
  }, []);

  const verificarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    setUser(user);
    carregarMeusAnuncios(user.id);
  };

  const carregarMeusAnuncios = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('erro ao carregar anúncios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.perfilContainer}>
        {/* Cabeçalho do Perfil */}
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.details}>
              <h1 className={styles.title}>meu perfil</h1>
              <p className={styles.email}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            sair da conta
          </button>
        </div>

        {/* Meus Anúncios */}
        <div className={styles.meusAnuncios}>
          <h2 className={styles.sectionTitle}>meus anúncios</h2>
          
          {produtos.length === 0 ? (
            <div className={styles.empty}>
              <p>você ainda não tem nenhum anúncio</p>
              <button 
                onClick={() => router.push('/novo-anuncio')}
                className="primary"
                style={{ marginTop: '16px' }}
              >
                criar primeiro anúncio
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

