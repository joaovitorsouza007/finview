# Artigo para o LinkedIn — rascunho

> Título sugerido:
> **"Eu não sabia para onde meu dinheiro ia — então construí um app para descobrir"**

---

Não me lembro quantas planilhas eu criei e abandonei. Só sei que, em todas elas, o final era o
mesmo: eu abria no domingo, preenchia três dias e nunca mais voltava.

O problema não era preguiça. Era que **nenhuma ferramenta parecia ter sido feita para mim**.

Foi isso que me levou a construir o **FinView** — e este artigo conta essa história: o problema, a
solução, a stack, os desafios e o que eu aprendi no caminho.

---

## O problema

Todo mundo que já recebeu um salário conhece a sensação: o dinheiro cai, o mês passa e, no dia 25,
você se pergunta: *"mas para onde foi tudo?"*

Os aplicativos que existem são um dos dois extremos:

- **Simples demais**: só mostram o saldo. Não respondem *para onde o dinheiro foi*.
- **Completos demais**: cheios de jargão financeiro, exigem conexão com banco logo de cara ou
  cobram para fazer algo que deveria ser básico.

E a planilha, que é o "meio-termo" clássico, exige disciplina que a maioria de nós não tem.
Resultado: gente vivendo no escuro sobre o próprio dinheiro, adiando o primeiro investimento e se
sentindo culpada por algo que não é culpa dela.

**Essa dor era minha.** Então decidi resolvê-la construindo o produto que eu queria usar.

## A solução: FinView

O **FinView** é um organizador de vida financeira com uma proposta simples:

> Abra uma vez por semana e enxergue sua vida financeira em um minuto: o que entrou, o que saiu,
> para onde o dinheiro foi e quanto está guardado para os seus objetivos.

Clareza, não jargão. Sem planilhas, sem notificações infinitas, sem gamificação.

Algumas das funcionalidades:

- **Dashboard com gráficos** (gastos por categoria, saldo ao longo do tempo, entrou vs. saiu,
  comparativo com o período anterior);
- **Categorização inteligente**: digite a descrição e o app sugere a categoria — e você pode criar
  uma regra automática em um clique ("netflix" sempre vira Lazer);
- **Metas de investimento** e metas personalizadas com progresso automático;
- **Conexão com bancos via Open Finance**: autorize o acesso e os últimos 90 dias de movimentações
  chegam sozinhos;
- **PWA instalável e 100% responsivo** — usa no celular como um app nativo.

*[Insira aqui 2–3 prints: dashboard, tela de movimentações e tela de bancos.]*

## A stack

Construí o FinView como um produto completo — não só um frontend bonito:

| Camada         | Tecnologias                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| **Frontend**   | React, Vite, Tailwind CSS, Recharts, Zustand, React Router, PWA                     |
| **Backend**    | Node.js, Express, Prisma, JWT, bcrypt                                               |
| **Banco**      | PostgreSQL gerenciado no Supabase                                                   |
| **Integração** | Open Finance brasileiro via Pluggy                                                  |
| **Testes**     | Vitest + Supertest (51 testes automatizados)                                        |
| **Deploy**     | Vercel (frontend) + Railway (API) + Supabase (banco)                                |

Escolhi essas tecnologias pensando em produtividade e evolução: React + Vite pelo ecossistema e
velocidade de desenvolvimento, Tailwind pela consistência do design, Prisma pela segurança do
schema e o Open Finance real (Pluggy) para conectar contas de verdade.

## Os desafios (e como resolvi)

### 1. Segurança no Open Finance

Ler a conta do usuário exige guardar o token de sessão do OAuth. Guardá-lo em texto puro seria
inaceitável. A solução foi **criptografar o token com AES-256-GCM** antes de persistir. E, para que
o desenvolvimento nunca dependa de um banco real, criei um **modo demonstração**: sem chaves de API,
o fluxo completo funciona com dados fictícios.

### 2. O deploy que não conectava no banco

Quando fui publicar, a API não conseguia alcançar o banco. Depois de investigar o DNS, descobri
algo que ninguém te conta no tutorial: **projetos novos do Supabase só expõem a conexão direta via
IPv6** — e meu provedor de deploy não tem rota IPv6. A solução foi migrar para o **pooler
dual-stack** do Supabase. Hoje: frontend na Vercel, API no Railway e banco no Supabase, tudo no ar.

### 3. Categorização automática + responsividade

Dois problemas "de produto" que aparecem depois: sugerir a categoria certa em **toda** entrada de
dados (digitação, CSV, banco) e manter a interface confortável em **qualquer tela**. Centralizei a
lógica de categorização no servidor com uma ordem de prioridade clara e reestruturei os grids e o
menu para funcionarem de um iPhone SE a um desktop 1920px.

## O que eu aprendi

1. **Segurança não é um requisito, é uma premissa.** Criptografar dados sensíveis desde o início
   evita retrabalho gigante.
2. **Produção é outro planeta.** O que funciona na sua rede pode falhar no servidor em nuvem —
   aprendi isso na pele com o IPv6.
3. **Responsividade é disciplina, não detalhe.** Área de toque mínima e grids adaptativos fazem a
   diferença entre "abre no celular" e "é bom de usar no celular".
4. **Projeto pessoal é o melhor laboratório.** Em um só produto eu pratiquei autenticação, API,
   banco de dados, PWA, integração externa e testes automatizados — tudo isso resolvendo uma dor
   real.

## O código está aberto

O FinView está no GitHub, com README completo, testes e instruções para rodar localmente:

🔗 **Repositório:** https://github.com/joaovitorsouza007/finview
🔗 **App no ar:** https://finview-ivory.vercel.app

Se você se identificou com o problema — ou se tem uma sugestão de funcionalidade — fica o convite:
dê uma olhada, deixe uma ⭐ e me conte o que achou. Toda contribuição é bem-vinda.

---

*Feito por João Vitor Souza da Silva — estudante de programação construindo produtos de verdade.*

[LinkedIn](https://www.linkedin.com/in/jo%C3%A3o-vitor-souza-da-silva-8b55122ba/) · [GitHub](https://github.com/joaovitorsouza007)
