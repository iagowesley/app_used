'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function PoliticaPrivacidade() {
    return (
        <div className={styles.policyContainer}>
            <div className={styles.policyContent}>
                <Link href="/" className={styles.backButton}>
                    ← voltar
                </Link>

                <h1 className={styles.policyTitle}>política de privacidade</h1>
                <p className={styles.lastUpdated}>última atualização: novembro de 2025</p>

                <section className={styles.policySection}>
                    <h2>1. introdução</h2>
                    <p>
                        bem-vindo à used. esta política de privacidade explica como coletamos,
                        usamos, armazenamos e protegemos suas informações pessoais quando você
                        utiliza nossa plataforma de marketplace.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>2. informações que coletamos</h2>
                    <p>coletamos as seguintes informações:</p>
                    <ul>
                        <li><strong>dados de cadastro:</strong> nome, e-mail, telefone e senha criptografada</li>
                        <li><strong>dados de anúncios:</strong> fotos, descrições, preços e informações de produtos</li>
                        <li><strong>dados de uso:</strong> informações sobre como você usa a plataforma</li>
                        <li><strong>dados de localização:</strong> cidade e bairro informados nos anúncios</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>3. como usamos suas informações</h2>
                    <p>utilizamos suas informações para:</p>
                    <ul>
                        <li>permitir que você crie e gerencie anúncios</li>
                        <li>facilitar a comunicação entre compradores e vendedores</li>
                        <li>melhorar nossos serviços e experiência do usuário</li>
                        <li>enviar notificações importantes sobre sua conta</li>
                        <li>prevenir fraudes e garantir a segurança da plataforma</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>4. compartilhamento de informações</h2>
                    <p>
                        não vendemos suas informações pessoais. compartilhamos informações apenas
                        quando necessário para:
                    </p>
                    <ul>
                        <li>exibir seus anúncios publicamente na plataforma</li>
                        <li>cumprir obrigações legais</li>
                        <li>proteger os direitos e segurança da used e de nossos usuários</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>5. armazenamento e segurança</h2>
                    <p>
                        suas informações são armazenadas em servidores seguros e protegidas por
                        medidas de segurança técnicas e organizacionais. utilizamos criptografia
                        para proteger dados sensíveis como senhas.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>6. seus direitos</h2>
                    <p>você tem direito a:</p>
                    <ul>
                        <li>acessar suas informações pessoais</li>
                        <li>corrigir dados incorretos ou incompletos</li>
                        <li>solicitar a exclusão de sua conta e dados</li>
                        <li>revogar consentimentos dados anteriormente</li>
                        <li>exportar seus dados em formato legível</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>7. cookies e tecnologias similares</h2>
                    <p>
                        utilizamos cookies e tecnologias similares para melhorar sua experiência,
                        manter você conectado e analisar o uso de nossa plataforma.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>8. alterações nesta política</h2>
                    <p>
                        podemos atualizar esta política de privacidade periodicamente. notificaremos
                        você sobre mudanças significativas por e-mail ou através de um aviso em
                        nossa plataforma.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>9. contato</h2>
                    <p>
                        para questões sobre esta política de privacidade ou sobre seus dados pessoais,
                        entre em contato conosco através do e-mail: suporte@used.com.br
                    </p>
                </section>
            </div>
        </div>
    );
}
