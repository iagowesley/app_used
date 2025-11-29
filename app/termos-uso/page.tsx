'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function TermosUso() {
    return (
        <div className={styles.policyContainer}>
            <div className={styles.policyContent}>
                <Link href="/" className={styles.backButton}>
                    ← voltar
                </Link>

                <h1 className={styles.policyTitle}>termos de uso</h1>
                <p className={styles.lastUpdated}>última atualização: novembro de 2025</p>

                <section className={styles.policySection}>
                    <h2>1. aceitação dos termos</h2>
                    <p>
                        ao acessar e usar a plataforma used, você concorda em cumprir estes termos
                        de uso. se você não concorda com qualquer parte destes termos, não deve
                        usar nossa plataforma.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>2. descrição do serviço</h2>
                    <p>
                        a used é uma plataforma online que conecta vendedores e compradores de
                        produtos usados e seminovos. facilitamos a publicação de anúncios e a
                        comunicação entre as partes, mas não somos parte das transações realizadas.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>3. cadastro e conta</h2>
                    <p>para usar a plataforma, você deve:</p>
                    <ul>
                        <li>ter pelo menos 18 anos de idade</li>
                        <li>fornecer informações verdadeiras e atualizadas</li>
                        <li>manter a confidencialidade de sua senha</li>
                        <li>ser responsável por todas as atividades em sua conta</li>
                        <li>notificar-nos imediatamente sobre uso não autorizado</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>4. regras de anúncios</h2>
                    <p>ao criar um anúncio, você concorda em:</p>
                    <ul>
                        <li>publicar apenas produtos que você possui legalmente</li>
                        <li>fornecer descrições precisas e honestas</li>
                        <li>usar fotos reais do produto anunciado</li>
                        <li>estabelecer preços justos e realistas</li>
                        <li>atualizar ou remover anúncios de produtos vendidos</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>5. itens proibidos</h2>
                    <p>é estritamente proibido anunciar:</p>
                    <ul>
                        <li>produtos ilegais ou roubados</li>
                        <li>armas, drogas ou substâncias controladas</li>
                        <li>produtos falsificados ou pirateados</li>
                        <li>conteúdo adulto ou ilegal</li>
                        <li>animais vivos</li>
                        <li>documentos oficiais ou identidades</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>6. responsabilidades do usuário</h2>
                    <p>você é responsável por:</p>
                    <ul>
                        <li>todas as negociações e transações realizadas</li>
                        <li>verificar a legitimidade de produtos e compradores</li>
                        <li>escolher locais seguros para encontros presenciais</li>
                        <li>resolver disputas diretamente com outros usuários</li>
                        <li>cumprir todas as leis aplicáveis</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>7. limitação de responsabilidade</h2>
                    <p>
                        a used não se responsabiliza por:
                    </p>
                    <ul>
                        <li>qualidade, segurança ou legalidade dos produtos</li>
                        <li>veracidade das informações nos anúncios</li>
                        <li>capacidade dos usuários de completar transações</li>
                        <li>danos ou perdas resultantes de transações</li>
                        <li>interrupções ou erros na plataforma</li>
                    </ul>
                </section>

                <section className={styles.policySection}>
                    <h2>8. propriedade intelectual</h2>
                    <p>
                        todo o conteúdo da plataforma, incluindo design, logotipos e código,
                        é propriedade da used e protegido por leis de propriedade intelectual.
                        você mantém os direitos sobre o conteúdo que publica.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>9. suspensão e encerramento</h2>
                    <p>
                        reservamo-nos o direito de suspender ou encerrar contas que violem estes
                        termos, sem aviso prévio. você pode encerrar sua conta a qualquer momento.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>10. modificações dos termos</h2>
                    <p>
                        podemos modificar estes termos a qualquer momento. continuando a usar a
                        plataforma após as alterações, você concorda com os novos termos.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>11. lei aplicável</h2>
                    <p>
                        estes termos são regidos pelas leis brasileiras. qualquer disputa será
                        resolvida nos tribunais competentes do brasil.
                    </p>
                </section>

                <section className={styles.policySection}>
                    <h2>12. contato</h2>
                    <p>
                        para questões sobre estes termos de uso, entre em contato conosco através
                        do e-mail: suporte@used.com.br
                    </p>
                </section>
            </div>
        </div>
    );
}
