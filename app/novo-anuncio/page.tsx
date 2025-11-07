// Página de Novo Anúncio
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  sanitizeNomeProduto, 
  sanitizeDescricao, 
  validarPreco, 
  validarWhatsApp,
  validarImagem,
  validarQuantidadeImagens 
} from '@/lib/security';
import { CATEGORIAS, CONDICOES, FORMAS_PAGAMENTO } from '@/lib/categorias';
import styles from './novo-anuncio.module.css';

export default function NovoAnuncio() {
  const [user, setUser] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [categoria, setCategoria] = useState('');
  const [condicao, setCondicao] = useState('');
  const [formasPagamento, setFormasPagamento] = useState<string[]>([]);
  const [fazEntrega, setFazEntrega] = useState(false);
  const [imagens, setImagens] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    });
  }, [router]);

  const formatarWhatsApp = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '');
    
    // Formata: XX X XXXX-XXXX
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 3) {
      return `${numeros.slice(0, 2)} ${numeros.slice(2)}`;
    } else if (numeros.length <= 7) {
      return `${numeros.slice(0, 2)} ${numeros.slice(2, 3)} ${numeros.slice(3)}`;
    } else {
      return `${numeros.slice(0, 2)} ${numeros.slice(2, 3)} ${numeros.slice(3, 7)}-${numeros.slice(7, 11)}`;
    }
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarWhatsApp(e.target.value);
    setWhatsapp(valorFormatado);
  };

  const handleFormaPagamentoChange = (value: string) => {
    setFormasPagamento(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleImagensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validar quantidade
    const validacaoQuantidade = validarQuantidadeImagens(files.length);
    if (!validacaoQuantidade.valido) {
      setErro(validacaoQuantidade.mensagem || 'quantidade de imagens inválida');
      return;
    }

    // Validar cada arquivo
    for (const file of files) {
      const validacao = validarImagem(file);
      if (!validacao.valido) {
        setErro(validacao.mensagem || 'imagem inválida');
        return;
      }
    }

    setImagens(files);
    setErro('');

    // Criar previews
    const newPreviewUrls: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewUrls.push(reader.result as string);
        if (newPreviewUrls.length === files.length) {
          setPreviewUrls(newPreviewUrls);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removerImagem = (indice: number) => {
    const novasImagens = imagens.filter((_, i) => i !== indice);
    const novosPreviews = previewUrls.filter((_, i) => i !== indice);
    setImagens(novasImagens);
    setPreviewUrls(novosPreviews);
  };

  const uploadImagens = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of files) {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      // Fazer upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública da imagem
      const { data } = supabase.storage
        .from('imagens')
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Validações de segurança
      if (!nome || !descricao || !preco || !whatsapp || !categoria || !condicao) {
        throw new Error('todos os campos são obrigatórios');
      }

      if (formasPagamento.length === 0) {
        throw new Error('selecione pelo menos uma forma de pagamento');
      }

      // Validar quantidade de imagens
      const validacaoQtd = validarQuantidadeImagens(imagens.length);
      if (!validacaoQtd.valido) {
        throw new Error(validacaoQtd.mensagem);
      }

      // Validar e sanitizar nome
      const nomeSanitizado = sanitizeNomeProduto(nome);
      if (nomeSanitizado.length < 3) {
        throw new Error('nome do produto deve ter pelo menos 3 caracteres');
      }

      // Validar e sanitizar descrição
      const descricaoSanitizada = sanitizeDescricao(descricao);
      if (descricaoSanitizada.length < 10) {
        throw new Error('descrição deve ter pelo menos 10 caracteres');
      }

      // Validar preço
      const validacaoPreco = validarPreco(preco);
      if (!validacaoPreco.valido || !validacaoPreco.valor) {
        throw new Error(validacaoPreco.mensagem || 'preço inválido');
      }

      // Validar WhatsApp
      if (!validarWhatsApp(whatsapp)) {
        throw new Error('por favor, insira um whatsapp válido (11 dígitos)');
      }

      // Upload das imagens
      const urlsImagens = await uploadImagens(imagens);

      // Salvar produto no banco
      const { error: insertError } = await supabase
        .from('produtos')
        .insert([
          {
            user_id: user.id,
            nome: nomeSanitizado.toLowerCase(),
            descricao: descricaoSanitizada.toLowerCase(),
            preco: validacaoPreco.valor,
            imagens: urlsImagens,
            whatsapp: whatsapp,
            categoria: categoria,
            condicao: condicao,
            formas_pagamento: formasPagamento,
            faz_entrega: fazEntrega,
          },
        ]);

      if (insertError) throw insertError;

      // Redirecionar para a página inicial
      router.push('/');
    } catch (error: any) {
      setErro(error.message || 'erro ao criar anúncio');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>criar anúncio</h1>
        <p className={styles.subtitle}>preencha os dados do seu produto</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Seção Esquerda - Upload de Imagens */}
          <div className={styles.leftSection}>
            <div className={styles.imageUpload}>
              <label className={styles.uploadLabel}>
                fotos do produto (mínimo 3, máximo 6)
              </label>
              
              {previewUrls.length > 0 ? (
                <div className={styles.previewGrid}>
                  {previewUrls.map((url, indice) => (
                    <div key={indice} className={styles.previewItem}>
                      <img src={url} alt={`preview ${indice + 1}`} className={styles.previewImage} />
                      <button
                        type="button"
                        onClick={() => removerImagem(indice)}
                        className={styles.removeButton}
                        disabled={loading}
                      >
                        ×
                      </button>
                      <span className={styles.imageNumber}>{indice + 1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <label htmlFor="imagens" className={styles.imageLabel}>
                  <div className={styles.uploadPlaceholder}>
                    <img src="/novo-anuncio/camera.png" alt="câmera" className={styles.uploadIcon} />
                    <span>clique para adicionar 3 a 6 fotos</span>
                  </div>
                </label>
              )}
              
              <input
                id="imagens"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagensChange}
                className={styles.fileInput}
                disabled={loading}
              />
              
              {previewUrls.length > 0 && (
                <label htmlFor="imagens" className={styles.addMoreButton}>
                  + adicionar mais fotos
                </label>
              )}
            </div>
          </div>

          {/* Seção Direita - Campos do Formulário */}
          <div className={styles.rightSection}>
            {/* Grid de 2 colunas */}
            <div className={styles.fieldsGrid}>
              {/* Categoria */}
              <div className="form-group">
                <label htmlFor="categoria">categoria do produto</label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                  disabled={loading}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    backgroundColor: loading ? '#f5f5f5' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="">selecione uma categoria</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condição do Produto */}
              <div className="form-group">
                <label htmlFor="condicao">condição do produto</label>
                <select
                  id="condicao"
                  value={condicao}
                  onChange={(e) => setCondicao(e.target.value)}
                  required
                  disabled={loading}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    backgroundColor: loading ? '#f5f5f5' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="">selecione a condição</option>
                  {CONDICOES.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço */}
              <div className="form-group">
                <label htmlFor="preco">preço (R$)</label>
                <input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>

              {/* WhatsApp */}
              <div className="form-group">
                <label htmlFor="whatsapp">whatsapp para contato</label>
                <input
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="11 9 1234-5678"
                  required
                  disabled={loading}
                  maxLength={15}
                />
                <small className={styles.hint}>formato: xx x xxxx-xxxx</small>
              </div>

              {/* Nome - Full Width */}
              <div className={`form-group ${styles.fieldFullWidth}`}>
                <label htmlFor="nome">nome do item</label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="ex: bicicleta aro 26"
                  required
                  disabled={loading}
                />
              </div>

              {/* Descrição - Full Width */}
              <div className={`form-group ${styles.fieldFullWidth}`}>
                <label htmlFor="descricao">descrição</label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="descreva o produto, estado de conservação, etc."
                  required
                  disabled={loading}
                />
              </div>

              {/* Formas de Pagamento - Full Width */}
              <div className={`form-group ${styles.fieldFullWidth}`}>
                <label>formas de pagamento aceitas</label>
                <div className={styles.checkboxGroup}>
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <label key={forma.value} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        value={forma.value}
                        checked={formasPagamento.includes(forma.value)}
                        onChange={() => handleFormaPagamentoChange(forma.value)}
                        disabled={loading}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>
                        {forma.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Opção de Entrega - Full Width */}
              <div className={`form-group ${styles.fieldFullWidth}`}>
                <label className={styles.checkboxLabel} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={fazEntrega}
                    onChange={(e) => setFazEntrega(e.target.checked)}
                    disabled={loading}
                    className={styles.checkbox}
                    style={{ width: 'auto' }}
                  />
                  <span className={styles.checkboxText} style={{ fontSize: '16px', fontWeight: '500' }}>
                     faço entrega do produto
                  </span>
                </label>
                <small className={styles.hint} style={{ marginLeft: '32px' }}>
                  marque esta opção se você faz entrega do produto
                </small>
              </div>
            </div>

            {/* Erro e Botão Submit */}
            {erro && <div className="error-message">{erro}</div>}

            <button 
              type="submit" 
              className={`primary ${styles.submitButton}`}
              disabled={loading}
            >
              {loading ? 'criando anúncio...' : 'cadastrar item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

