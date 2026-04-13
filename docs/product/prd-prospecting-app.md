# PRD — Plateforme de prospection cold outreach de A à Z

**Nom de travail :** ProspectOS / Uprising Outreach  
**Version :** 1.0  
**Date :** 2026-04-13  
**Type de produit :** Web app SaaS interne / plateforme de sales engagement  
**Audience principale :** agence de prospection, agence web/IA, équipe SDR/closer, opérateurs internes  
**Contexte technique cible :** backend Python/FastAPI, base de données PostgreSQL/Supabase, frontend dashboard moderne [cite:4][cite:18]

## Vue d’ensemble

Le produit visé est une plateforme de prospection B2B complète couvrant le cycle entier du cold outreach : sourcing, enrichissement, qualification, personnalisation IA, séquences multicanales, envoi, gestion des réponses, pipeline commercial et analytics.[cite:2][cite:25] L’objectif est de remplacer un empilement d’outils séparés par un système unique orienté exécution, capable de transformer des leads froids en rendez-vous qualifiés avec un maximum d’automatisation et un minimum de friction opérationnelle.[cite:1][cite:25][cite:28]

Le produit doit être pensé comme un **system of action** et non comme un simple CRM. Les plateformes modernes de sales engagement se différencient par la qualité de leurs données, leurs séquences automatisées, leur synchronisation d’activité et leurs recommandations pilotées par IA.[cite:25] Le produit doit donc centraliser la donnée, exécuter les campagnes et faire remonter les prochaines actions utiles à l’utilisateur.[cite:25][cite:28]

## Problème à résoudre

Les équipes de prospection opérant avec plusieurs outils souffrent généralement de cinq problèmes structurels : listes de leads incomplètes, personnalisation faible, séquences peu pilotées, suivi fragmenté et délivrabilité mal maîtrisée.[cite:25][cite:26] À cela s’ajoute la difficulté à relier la qualité du lead, la qualité du message et la santé de l’infrastructure email dans un seul workflow décisionnel.[cite:26][cite:29]

Pour une agence comme Uprising Studio, le besoin métier est encore plus spécifique : trouver rapidement des PME locales ou services à domicile, identifier leurs faiblesses digitales, générer un angle d’approche crédible, envoyer la séquence, puis convertir les réponses en appels et opportunités réelles.[cite:1][cite:2] Une plateforme dédiée doit rendre ce flux répétable, mesurable et extensible sans dépendre d’outils coûteux ou d’orchestrations manuelles fragiles.[cite:17][cite:19]

## Objectifs produit

### Objectifs business

- Réduire le temps entre la création d’un ICP et le lancement d’une campagne exploitable.[cite:20][cite:23]
- Augmenter le taux de réponse positive grâce à une meilleure qualification et à une personnalisation contextualisée.[cite:12][cite:26]
- Structurer un pipeline complet, du lead brut jusqu’au rendez-vous booké et au deal créé.[cite:25]
- Donner à l’équipe une base de travail propriétaire, extensible et majoritairement open source ou à faible coût.[cite:17]

### Objectifs utilisateurs

- Importer ou sourcer une liste de prospects sans friction.[cite:2][cite:25]
- Savoir instantanément quels leads sont prioritaires et pourquoi.[cite:25]
- Générer des messages adaptés au contexte réel du prospect plutôt que des templates génériques.[cite:12][cite:26]
- Lancer et suivre des séquences dans une interface unique, avec visibilité sur réponses, tâches et opportunités.[cite:25][cite:28]

### Non-objectifs

- Remplacer un CRM enterprise complet de type Salesforce dès la V1.[cite:25]
- Couvrir tous les canaux possibles dès le premier release, notamment SMS/WhatsApp si non essentiels au go-to-market initial.[cite:28]
- Fournir une marketplace d’intégrations large dès le MVP.[cite:28]
- Construire un produit de marketing automation B2C ou newsletter grand public.[cite:29]

## Utilisateurs cibles

| Persona | Description | Besoin principal |
|---|---|---|
| Admin / fondateur | Configure les workspaces, ICP, boîtes mail, règles de scoring, dashboards | Vue globale, contrôle du système, pilotage business [cite:23][cite:25] |
| SDR / opérateur prospection | Source, enrichit, qualifie, lance les campagnes, traite les réponses | Rapidité d’exécution, vues leads, séquences, inbox [cite:25][cite:28] |
| Closer | Reçoit les leads chauds, gère les opportunités et les rendez-vous | Historique complet du compte et du contact [cite:25] |
| Manager | Suit la performance des équipes et des campagnes | Analytics, reporting, attribution des résultats [cite:25][cite:28] |
| Reviewer / QA | Valide certains messages ou segments avant envoi | Contrôle qualité et réduction du risque deliverability [cite:26][cite:29] |

## Proposition de valeur

Le produit doit permettre de passer de la donnée brute à l’action commerciale dans une seule application. Sa proposition de valeur principale repose sur trois axes : **données exploitables**, **personnalisation actionnable**, **orchestration complète**.[cite:25][cite:28]

Le différenciateur recommandé pour ce produit est l’ajout d’un moteur d’audit automatique du prospect, capable d’extraire des signaux faibles depuis le site web ou la présence digitale du lead afin de produire un angle de message beaucoup plus concret que les plateformes génériques.[cite:1][cite:2] Cette spécialisation est particulièrement cohérente pour une agence vendant site, SEO, IA, automatisation et systèmes d’acquisition.[cite:1]

## Portée fonctionnelle

### In scope — V1 / MVP robuste

- Gestion multi-workspace simple.[cite:23]
- Import CSV et sourcing externe via connecteurs/scrapers.[cite:2][cite:25]
- Normalisation et déduplication des leads.[cite:25]
- Enrichissement des leads et entreprises.[cite:25][cite:28]
- Lead scoring configurable par règles.[cite:25]
- Génération IA de messages et variantes.[cite:25]
- Création de campagnes et séquences email-first.[cite:25][cite:28]
- Synchronisation boîte mail et remontée des réponses.[cite:25]
- Inbox unifiée avec classification assistée.[cite:28]
- Pipeline commercial basique intégré.[cite:25]
- Dashboard KPI et analytics essentiels.[cite:23][cite:25]
- Garde-fous deliverability et conformité de base.[cite:26][cite:29]

### Out of scope — V1

- Dialer natif complet avec VoIP avancée.[cite:28]
- Réseau social propriétaire ou extension navigateur complexe.[cite:28]
- Attribution marketing multi-touch enterprise.[cite:25]
- BI avancée avec entrepôt analytique séparé.[cite:23]
- Gestion financière complète (facturation, recouvrement, comptabilité).[cite:23]

## Principes produit

- **Data first** : toute action est fondée sur une donnée lead/contact/entreprise propre et historisée.[cite:25]
- **Action over storage** : l’application doit aider à agir, pas seulement à stocker des enregistrements.[cite:25]
- **AI assist, not blind autopilot** : l’IA doit proposer, scorer, prioriser et rédiger, mais les règles critiques doivent rester auditables.[cite:25]
- **Deliverability by design** : aucun lancement de campagne ne doit contourner les protections email.[cite:26][cite:29]
- **Operational clarity** : chaque écran doit permettre de décider rapidement quoi faire ensuite.[cite:28]

## Exigences fonctionnelles

### 1. Workspaces et administration

Le système doit permettre de créer un ou plusieurs workspaces avec utilisateurs, rôles, paramètres d’entreprise, domaines d’envoi, boîtes connectées, signatures, fuseau horaire et préférences de campagne.[cite:23][cite:28] Il doit également permettre de définir des rôles minimaux : Admin, Manager, SDR, Closer et Viewer.[cite:28]

**Exigences :**
- Création d’un workspace avec nom, branding interne, timezone, devise, langue.
- Gestion d’utilisateurs avec invitation par email.
- Attribution de rôles et permissions par module.
- Configuration des domaines et boîtes d’envoi.
- Journal d’audit des actions d’administration.

**Critères d’acceptation :**
- Étant donné un Admin authentifié, lorsqu’il crée un workspace, alors le système crée l’espace, les paramètres par défaut et le premier utilisateur propriétaire.[cite:21]
- Étant donné un utilisateur Viewer, lorsqu’il tente de modifier une campagne, alors le système refuse l’action et journalise l’événement.[cite:21]

### 2. Sourcing de leads

Le système doit permettre d’ingérer des leads par plusieurs canaux : import CSV, scraping/connecteurs, saisie manuelle et enrichissement post-import.[cite:2][cite:25] Le sourcing doit être séparé de la qualification afin de préserver la traçabilité de la source initiale.[cite:25]

**Exigences :**
- Import CSV avec mapping dynamique des colonnes.
- Gestion de sources nommées (ex. Google Maps, import manuel, API externe).
- Support d’un pipeline de scraping via prestataire externe/API.
- Aperçu avant import et détection des doublons.
- Enregistrement de la date d’acquisition, de la source et de l’opérateur.

**Critères d’acceptation :**
- Étant donné un fichier CSV valide, lorsqu’un utilisateur mappe les colonnes et confirme, alors les leads sont créés avec la source liée et les lignes invalides sont isolées.[cite:21]
- Étant donné deux leads partageant le même domaine ou email principal, lorsqu’un import est exécuté, alors le système détecte le doublon selon les règles configurées.[cite:25]

### 3. Normalisation et déduplication

La plateforme doit normaliser les noms, URLs, numéros, adresses et catégories afin d’éviter la fragmentation de la donnée.[cite:25] Une logique de fusion doit permettre soit l’automerge, soit une revue manuelle selon le niveau de confiance.[cite:25]

**Exigences :**
- Normalisation des domaines et URLs.
- Normalisation des numéros téléphoniques au format international.
- Détection de doublons sur email, domaine, combinaison nom+ville, téléphone.
- Moteur de fusion avec score de confiance.
- Historique des fusions et possibilité de rollback administratif.

### 4. Modèle lead / company / contact

Le produit doit distinguer l’entité **entreprise**, les **contacts** rattachés et le **lead opérationnel** utilisable dans les campagnes.[cite:25] Cette séparation permet de faire de la prospection multi-contact par compte tout en conservant une vue consolidée des activités.[cite:25]

**Champs minimaux requis :**
- Company : nom, domaine, secteur, ville, pays, taille estimée, source, site web, tags.
- Contact : prénom, nom, poste, email, téléphone, LinkedIn, statut vérification.
- Lead : score, owner, statut, campagne active, prochaine action, source, température.

### 5. Enrichissement

Le système doit enrichir les leads avec des données de contact et des signaux utiles à la qualification, à la personnalisation et au choix du canal.[cite:25][cite:28] L’enrichissement peut être synchrone ou asynchrone selon le fournisseur ou le coût d’exécution.[cite:25]

**Exigences :**
- Recherche/ajout d’email professionnel.
- Ajout de téléphone, site web, LinkedIn, catégorie, taille et localisation.
- Vérification d’email et score de confiance.
- Capture de signaux de maturité digitale (si disponibles).
- Historique d’enrichissement avec source, date et statut.

**Critères d’acceptation :**
- Étant donné un lead sans email, lorsqu’une tâche d’enrichissement s’exécute avec succès, alors le lead est mis à jour et le statut d’enrichissement passe à “completed”.[cite:21]
- Étant donné un enrichissement partiel, lorsqu’aucun email fiable n’est trouvé, alors le système marque le lead “needs_review” et n’autorise pas l’entrée automatique en campagne.[cite:26][cite:29]

### 6. Audit automatique du prospect

Le produit doit proposer un moteur d’audit automatique facultatif, particulièrement adapté à une agence de services digitaux. Ce moteur doit analyser le site du prospect et remonter des signaux exploitables commercialement comme présence de formulaire, vitesse perçue, CTA, design daté, structure SEO de base, éléments de tracking visibles ou signaux d’incohérence de marque.[cite:1][cite:2]

**Exigences :**
- Crawler léger du site du prospect.
- Snapshot des métadonnées principales.
- Détection de points de friction simples.
- Résumé IA “opportunity brief”.
- Exposition de ces signaux dans la fiche lead et dans le contexte de génération de message.

### 7. ICP, segmentation et scoring

Le produit doit permettre de définir des ICP (Ideal Customer Profiles), des segments et des règles de scoring explicites.[cite:25] Les plateformes modernes utilisent l’IA pour prioriser, mais les règles doivent rester lisibles et contrôlables.[cite:25]

**Exigences :**
- Création d’un ICP avec critères obligatoires, bonus et exclusions.
- Segments dynamiques basés sur filtres enregistrés.
- Score explicable avec détail des règles appliquées.
- Champs custom pour règles métiers.
- Statut “qualified / disqualified / review”.

**Critères d’acceptation :**
- Étant donné un ICP “services locaux”, lorsqu’un lead correspond aux critères ville+niche+site actif, alors un score initial est calculé et la raison est affichée.[cite:21]
- Étant donné une règle d’exclusion, lorsqu’un lead y correspond, alors il ne peut pas être ajouté à une campagne active sans override autorisé.[cite:21]

### 8. Moteur IA de personnalisation

Le produit doit générer des messages contextualisés, des variantes de ton et des résumés d’angle à partir des données enrichies et des signaux d’audit.[cite:25][cite:26] Les pratiques récentes montrent que les emails génériques et peu spécifiques performent mal, tandis que les messages ancrés dans des observations concrètes restent plus crédibles.[cite:12][cite:26]

**Exigences :**
- Génération de sujet, hook, corps court, CTA, follow-up.
- Génération de messages par canal : email, LinkedIn, note interne, script d’appel.
- Variables dynamiques et garde-fous anti-hallucination.
- Aperçu et édition manuelle avant validation.
- Historique des prompts, versions et résultats.

**Contraintes :**
- L’IA ne doit pas inventer de faits non présents dans le contexte source.
- Les contenus générés doivent être auditables et régénérables.
- Les templates doivent pouvoir être verrouillés ou semi-ouverts selon le rôle.

### 9. Templates et bibliothèque d’offres

Le système doit inclure une bibliothèque de templates réutilisables par niche, offre, ton, langue et canal.[cite:25][cite:28] Les utilisateurs doivent pouvoir créer des “offer packs” internes correspondant aux offres récurrentes de l’agence.[cite:1]

**Exemples de packs :**
- Refonte site web.
- SEO local.
- IA réceptionniste.
- Automatisation CRM.
- Génération de contenu.
- Système d’acquisition complet.

### 10. Campagnes et séquences

Le produit doit permettre de créer des campagnes composées de séquences et d’étapes, avec délais, conditions d’entrée, règles d’arrêt et règles de branchement.[cite:25][cite:28] La gestion de cadences est un pilier d’une sales engagement platform moderne.[cite:25]

**Exigences :**
- Création de campagne par workspace.
- Définition d’un objectif (book call, audit, réponse, relance).
- Ajout de séquences à étapes planifiées.
- Support des conditions : pas de réponse, réponse positive, bounce, unsubscribe, ouverture si disponible.
- Mise en pause, reprise, clonage et archivage.
- Simulation de charge avant lancement.

**Critères d’acceptation :**
- Étant donné une campagne prête et une boîte saine, lorsqu’un utilisateur lance la campagne, alors le système planifie uniquement les leads éligibles dans les limites d’envoi configurées.[cite:21][cite:29]
- Étant donné une réponse reçue, lorsqu’elle est classée positive ou neutre, alors la séquence active s’arrête automatiquement et une tâche/opportunité peut être créée selon les règles.[cite:25][cite:28]

### 11. Exécution d’envoi email

Le système doit se connecter à des boîtes Gmail/Outlook ou autres providers compatibles, envoyer les emails, récupérer les statuts et journaliser les événements.[cite:25][cite:29] L’architecture doit prévoir des limites d’envoi par boîte, une planification horaire et des mécanismes de repli en cas d’échec.[cite:26][cite:29]

**Exigences :**
- Connexion OAuth ou credentials applicables selon provider.
- Envoi individualisé par lead/contact.
- Journalisation des events : sent, delivered si dispo, bounced, replied, unsubscribed.
- Gestion des signatures et alias.
- Fenêtres d’envoi par jour et timezone.

### 12. Deliverability et conformité

La délivrabilité doit être intégrée dès le design du produit. Les exigences 2026 sur l’authentification email sont strictes : SPF, DKIM et DMARC conformes sont incontournables, et l’absence de politique DMARC forte dégrade sérieusement la délivrabilité.[cite:26][cite:29] Les pratiques de volume doivent aussi rester prudentes : certaines sources récentes considèrent 50 à 100 emails par boîte et par jour comme une plage plus sûre pour le cold outreach moderne.[cite:29]

**Exigences :**
- Vérification SPF/DKIM/DMARC avant activation d’une boîte.[cite:26][cite:29]
- Score de santé boîte / domaine.
- Limites d’envoi quotidiennes configurables.
- Warmup ou statut warmup-ready selon intégration disponible.
- Blocage des campagnes si seuils critiques dépassés.
- Unsubscribe / opt-out et liste de suppression.
- Suivi des bounce rates et complaint proxies lorsque disponibles.[cite:29]
- Journal des événements de conformité.

**Critères d’acceptation :**
- Étant donné une boîte sans DKIM valide, lorsqu’un Admin tente de l’activer pour des campagnes, alors l’activation est refusée avec instruction corrective.[cite:21][cite:26]
- Étant donné une campagne qui ferait dépasser la limite quotidienne, lorsqu’elle est lancée, alors le système étale les envois sur les prochains créneaux disponibles.[cite:21][cite:29]

### 13. Inbox unifiée et traitement des réponses

Le produit doit proposer une inbox unifiée permettant de voir et traiter les réponses sans changer d’outil.[cite:28] Les réponses doivent être classées automatiquement ou semi-automatiquement afin d’accélérer le tri opérationnel.[cite:25]

**Exigences :**
- Vue conversation par lead/contact.
- Statuts de réponse : positive, neutral, objection, wrong_contact, unsubscribe, auto_reply, not_now.
- Actions rapides : assigner, répondre, créer tâche, créer opportunité, exclure, relancer plus tard.
- Réponse assistée par IA basée sur le contexte de thread.
- Synchronisation bidirectionnelle des messages lorsque supportée.[cite:25]

### 14. Tâches, reminders et next best action

Le système doit remonter la prochaine meilleure action (“next best action”) par lead ou compte, à partir de l’historique d’engagement et des règles métier.[cite:25] Cette capacité est explicitement identifiée comme un marqueur des plateformes modernes de sales engagement.[cite:25]

**Exigences :**
- Tâches automatiques post-réponse.
- Reminders de follow-up manuel.
- Suggestions d’actions : relancer, appeler, enrichir, disqualifier, assigner au closer.
- Vue “Today / Overdue / Suggested”.

### 15. Pipeline et opportunités

Le produit doit intégrer un pipeline commercial simple pour convertir les réponses en opportunités exploitables.[cite:25] L’objectif n’est pas de refaire un CRM enterprise, mais d’éviter la perte d’information entre l’outreach et le closing.[cite:25]

**Exigences :**
- Colonnes configurables (New Reply, Interested, Qualified, Meeting Booked, Proposal Sent, Won, Lost).
- Drag & drop simple ou changement de statut depuis la fiche.
- Valeur estimée, probabilité, date prévue, notes.
- Lien entre opportunité, compte, contact et campagne d’origine.

### 16. Analytics et reporting

Le système doit fournir des analytics utiles à la décision, en distinguant clairement activité, engagement, intention et résultat commercial.[cite:23][cite:25] Les métriques de vanité seules ne suffisent pas ; les équipes doivent voir ce qui produit de vraies réponses et des rendez-vous.[cite:12][cite:29]

**Métriques minimales :**
- Leads ajoutés / enrichis / qualifiés.
- Emails planifiés / envoyés / bounced / replied.
- Positive reply rate.
- Meetings booked.
- Conversion lead → reply → meeting → opportunity.
- Performance par campagne, segment, offre, sender, owner, source.
- Santé infrastructure : limite, volume, erreurs, boîtes inactives.[cite:29]

### 17. Recherche, filtres et bulk actions

L’interface doit permettre des actions massives sur les leads, tâches et campagnes afin de réduire les coûts opérationnels.[cite:28] Les filtres doivent être sauvegardables et utilisables comme segments.[cite:25]

**Exigences :**
- Recherche globale simple.
- Filtres combinables.
- Enregistrement de vues personnalisées.
- Bulk assign, bulk tag, bulk enrich, bulk add/remove campaign, bulk archive.

### 18. Audit log et observabilité métier

Le produit doit enregistrer les actions sensibles et permettre de comprendre qui a lancé quoi, modifié quoi et quand.[cite:23] Ceci aide autant au debugging qu’au contrôle opérationnel.[cite:23]

**Exigences :**
- Journal d’activité utilisateur.
- Journal des jobs système.
- Historique des changements critiques (templates, campagnes, statuts, fusions, permissions).
- Exposition d’un écran de diagnostics de jobs.

## Exigences non fonctionnelles

### Performance

- Chargement du dashboard principal en moins de 2 secondes sur un volume standard de données.[cite:28]
- Actions bulk de 500 leads traitées de manière asynchrone sans blocage UI.[cite:23]
- Pagination ou virtualisation sur les grandes tables.

### Fiabilité

- Les jobs critiques (enrichissement, exécution de séquence, traitement de réponse) doivent être idempotents et retryables.[cite:23]
- Les envois ne doivent jamais être dupliqués en cas de retry worker.
- Les événements de réponse doivent être traités au moins une fois avec déduplication applicative.

### Sécurité

- Authentification forte et sessions sécurisées.
- Contrôle d’accès par rôle sur tous les modules sensibles.[cite:27]
- Chiffrement des secrets et credentials de connexion.[cite:27]
- Journalisation des accès administratifs.

### Confidentialité et conformité

Une solution SaaS manipulant des données de prospection doit intégrer des exigences de base de conformité : fondement légal de traitement, droits des personnes, logique de data protection by design et procédures de notification adéquates en cas d’incident.[cite:27] Le produit doit donc documenter les consentements/opt-out quand applicables, respecter les demandes de suppression et limiter la conservation inutile des données.[cite:27]

### Maintenabilité

- Architecture modulaire backend.
- Couverture de tests sur domaines critiques.
- Migrations versionnées.
- Documentation API et événements.

## Workflow produit cible

### Flux principal

1. L’utilisateur crée ou choisit un ICP.[cite:20][cite:25]
2. Il importe ou source une liste de leads.[cite:2][cite:25]
3. Le système normalise, dédoublonne et enrichit.[cite:25]
4. Les leads reçoivent un score et un statut de qualification.[cite:25]
5. L’utilisateur génère ou sélectionne un pack d’offres + templates.[cite:1][cite:25]
6. Il crée une campagne et une séquence.[cite:25]
7. Le système vérifie l’éligibilité deliverability avant lancement.[cite:26][cite:29]
8. Les messages sont envoyés selon les limites et fenêtres.[cite:29]
9. Les réponses arrivent dans l’inbox unifiée et sont classées.[cite:25][cite:28]
10. Les leads chauds deviennent tâches, meetings ou opportunités.[cite:25]
11. Les analytics mettent à jour la performance par segment, offre et sender.[cite:25]

### Flux secondaire — revue manuelle

1. Un segment ou une campagne est marqué “review required”.
2. Un reviewer vérifie les leads et messages.
3. Il valide, modifie ou rejette certains éléments.
4. La campagne est ensuite relancée dans les limites configurées.

## Écrans et modules UI

| Module UI | Description | Priorité |
|---|---|---|
| Login / onboarding | Connexion, création workspace, connexion boîtes | Must [cite:23] |
| Dashboard | KPI, alertes, tâches du jour, boîtes à risque, campagnes actives | Must [cite:25][cite:28] |
| Leads table | Vue principale avec filtres, score, statut, actions bulk | Must [cite:28] |
| Lead detail drawer/page | Contexte complet lead/company/contact, activités, messages, notes | Must [cite:25] |
| Campaign builder | Création campagne, séquence, paramètres d’envoi | Must [cite:25] |
| Inbox | Réponses, classification, réponse assistée, assignation | Must [cite:28] |
| Pipeline | Vue opportunités / deals | Should [cite:25] |
| Templates / offers | Bibliothèque de messages et offres | Should [cite:25] |
| Analytics | Rapports de performance | Must [cite:25] |
| Settings | Users, boîtes, domaines, scoring, suppression list | Must [cite:26][cite:29] |
| Jobs / diagnostics | Observabilité opérateur | Could [cite:23] |

## Données et modèle conceptuel

### Entités principales

- Workspace
- User
- Role / Permission
- Company
- Contact
- Lead
- LeadSource
- EnrichmentJob / EnrichmentSnapshot
- AuditSnapshot
- ICP
- Segment
- ScoreRule / ScoreResult
- Campaign
- Sequence
- SequenceStep
- Template
- GeneratedMessage
- SenderAccount
- EmailEvent
- Conversation / Reply
- Task
- Meeting
- Opportunity
- Note
- Tag
- SuppressionEntry
- ActivityLog

### Relations clés

- Un workspace possède plusieurs users, campaigns, leads et sender accounts.
- Une company possède plusieurs contacts et plusieurs leads opérationnels possibles.[cite:25]
- Un lead peut être lié à une company, un contact principal, un owner et une campagne active.[cite:25]
- Une campagne contient une ou plusieurs séquences, elles-mêmes composées d’étapes.[cite:25]
- Chaque message généré référence un lead, un template, un contexte et une version de prompt.
- Les réponses se rattachent à une conversation et peuvent déclencher des tâches ou opportunités.[cite:25]

## Intégrations attendues

### Priorité haute

- Provider email (Gmail / Outlook ou équivalent).[cite:25][cite:29]
- Outil de sourcing ou scraping externe.[cite:2]
- Vérification email.
- Agenda/booking (ex. Calendly-like) pour meetings.
- Notifications internes (Slack/email).

### Priorité moyenne

- Enrichissement externe de données entreprise/contact.
- LinkedIn tasking ou synchronisation légère.[cite:28]
- Webhook entrant pour événements tiers.

## Architecture technique cible

L’architecture recommandée pour ce produit repose sur un backend Python/FastAPI, cohérent avec la préférence exprimée pour une stack Python sur l’application de prospection.[cite:4] Une base PostgreSQL/Supabase est adaptée pour stocker les entités relationnelles, les journaux et les états de campagne, tandis qu’une couche de workers asynchrones est nécessaire pour l’enrichissement, la génération IA, la planification d’envoi et le traitement d’événements.[cite:18][cite:23]

### Composants recommandés

| Couche | Choix recommandé | Rôle |
|---|---|---|
| Frontend | Next.js / dashboard web | Interface opérateur et management [cite:28] |
| Backend API | FastAPI | API métier, auth, orchestration [cite:4] |
| Base de données | PostgreSQL / Supabase | Stockage relationnel principal [cite:18] |
| Queue / jobs | Redis + worker queue | Exécution async, retries, scheduling [cite:23] |
| IA | Provider LLM configurable | Génération, classification, résumés [cite:25] |
| Email | Connecteurs provider + webhooks | Envoi et capture des réponses [cite:29] |
| Observabilité | Logs structurés + metrics | Debug, monitoring, audit [cite:23] |

## API / domaines backend

### Domaines métiers recommandés

- auth
- workspaces
- users
- leads
- companies
- contacts
- sourcing
- enrichment
- scoring
- audits
- campaigns
- sequences
- templates
- messaging
- inbox
- tasks
- pipeline
- analytics
- settings
- compliance
- webhooks

### Exemples d’endpoints

- `POST /workspaces`
- `POST /leads/import`
- `GET /leads`
- `POST /leads/{id}/enrich`
- `POST /icp`
- `POST /campaigns`
- `POST /campaigns/{id}/launch`
- `POST /templates/generate`
- `GET /inbox/conversations`
- `POST /replies/{id}/classify`
- `POST /opportunities`
- `GET /analytics/overview`

## Règles métier critiques

- Un lead sans email vérifié ou sans canal activable ne peut pas entrer en séquence automatique.[cite:26][cite:29]
- Une campagne ne peut pas être lancée si la boîte sélectionnée ne respecte pas les prérequis d’authentification email.[cite:26][cite:29]
- Une réponse classée positive, neutral ou objection stoppe les étapes futures tant qu’un humain ou une règle n’a pas relancé le flux.[cite:25]
- Un unsubscribe alimente immédiatement la suppression list du workspace.[cite:29]
- Un lead disqualifié ne doit plus recevoir de génération automatique sans override administratif.
- Les règles de priorité managériale peuvent surcharger le score automatique, mais le log doit conserver l’origine du changement.[cite:23]

## Instrumentation et événements

Le système doit émettre des événements applicatifs normalisés afin de tracer le cycle de vie du lead et de rendre l’analytics fiable.[cite:23][cite:25]

**Événements minimaux :**
- lead.created
- lead.deduplicated
- enrichment.requested
- enrichment.completed
- score.computed
- campaign.created
- campaign.launched
- sequence.step.scheduled
- email.sent
- email.bounced
- reply.received
- reply.classified
- task.created
- opportunity.created
- opportunity.stage_changed

## Priorisation de livraison

### Phase 1 — Fondation

- Auth, workspaces, rôles.
- Import leads, sources, déduplication.
- Modèle company/contact/lead.
- Leads table + lead detail.
- Sender accounts + vérification santé minimale.

### Phase 2 — Activation outreach

- Enrichissement.
- ICP, segments, scoring.
- Templates et génération IA.
- Campaign builder.
- Exécution d’envoi et scheduling.

### Phase 3 — Exploitation commerciale

- Inbox unifiée.
- Classification réponses.
- Tâches et next best action.
- Pipeline opportunités.
- Dashboard KPI.

### Phase 4 — Optimisation

- Audit automatique prospect.
- Analytics avancés.
- Expérimentation A/B.
- Diagnostics et observabilité étendue.
- Suggestions IA plus avancées.[cite:25]

## Indicateurs de succès

### KPIs produit

- Temps moyen ICP → campagne lancée.[cite:20][cite:23]
- Pourcentage de leads enrichis avec au moins un canal exploitable.[cite:25]
- Pourcentage de leads qualifiés acceptés en campagne.[cite:25]
- Temps moyen réponse → traitement humain.[cite:28]
- Taux d’usage hebdomadaire des modules clés par rôle.[cite:28]

### KPIs business

- Reply rate et positive reply rate par campagne.[cite:12][cite:29]
- Meetings booked par 1000 leads sourcés.[cite:25]
- Conversion par source, niche, offre et sender.[cite:25]
- Volume envoyé sans dépassement des seuils de sécurité deliverability.[cite:29]

## Risques produit

| Risque | Impact | Mitigation |
|---|---|---|
| Données de leads pauvres ou fausses | Campagnes inefficaces, réputation dégradée | Vérification, scoring, revue manuelle, exclusions [cite:25][cite:29] |
| Infrastructure email mal configurée | Bounce, spam, blocage d’envoi | Vérification SPF/DKIM/DMARC, health checks, blocages préventifs [cite:26][cite:29] |
| Personnalisation IA faible ou hallucinée | Réponses faibles, perte de crédibilité | Context building strict, aperçu humain, garde-fous [cite:12][cite:26] |
| Scope creep produit | Délai et dette technique | Définition claire du MVP et out-of-scope [cite:21][cite:23] |
| Dépendance trop forte à des services tiers | Coûts, instabilité, limitations | Architecture modulaire, abstraction d’intégrations [cite:23] |
| Non-conformité privacy/compliance | Risque juridique et réputationnel | Data protection by design, logs, suppression handling [cite:27] |

## Hypothèses

- Les utilisateurs ont besoin en priorité d’une solution email-first avant d’activer des canaux plus complexes.[cite:28][cite:29]
- La meilleure source de valeur initiale vient d’une exécution plus cohérente, pas d’une IA plus spectaculaire.[cite:25]
- Les équipes accepteront une validation manuelle partielle si elle améliore les résultats et réduit le risque de spam.[cite:26]
- Les intégrations tierces resteront nécessaires pour certaines briques (sourcing, vérification, email). [cite:2][cite:25]

## Questions ouvertes

- Le MVP doit-il inclure dès le départ plusieurs boîtes d’envoi par workspace ou une seule ?
- Le scoring doit-il être purement rule-based en V1 ou inclure une couche d’apprentissage léger ?
- Le module d’audit prospect doit-il être synchrone (à la demande) ou batché ?
- Quelle profondeur de synchronisation email est requise en V1 : envoi + lecture des replies, ou conversation thread complète ?
- Le pipeline doit-il rester interne ou préparer une future sync avec un CRM externe ?[cite:25]

## Backlog épique initial

### Epic 1 — Core platform
- Authentification et rôles.
- Workspaces.
- Paramètres globaux.
- Journal d’audit.

### Epic 2 — Lead data layer
- Import CSV.
- Sources.
- Déduplication.
- Modèles lead/company/contact.
- Tags et vues filtrées.

### Epic 3 — Enrichment & qualification
- Jobs d’enrichissement.
- Vérification email.
- ICP.
- Segments.
- Score explicable.

### Epic 4 — AI messaging
- Templates.
- Prompt context builder.
- Génération multi-variantes.
- Édition et validation.

### Epic 5 — Campaign execution
- Campaign builder.
- Scheduling.
- Throttling.
- Sender health rules.
- Lancement/pause/reprise.

### Epic 6 — Inbox & response ops
- Conversations.
- Classification.
- Réponses assistées.
- Tâches.
- Assignation.

### Epic 7 — Pipeline & reporting
- Opportunités.
- Stages.
- Dashboard.
- Rapports de conversion.

### Epic 8 — Prospect intelligence
- Audit site.
- Opportunity brief.
- Signal extraction.
- Angles d’approche assistés.

## Définition du Done

Une fonctionnalité ne peut être considérée comme terminée que si :

- Les exigences fonctionnelles sont implémentées et testées.[cite:21]
- Les critères d’acceptation Given/When/Then sont validés.[cite:21]
- Les événements métier associés sont émis correctement.[cite:23]
- Les permissions et cas d’erreur sont couverts.[cite:27]
- Les logs et métriques critiques sont présents.[cite:23]
- La documentation développeur et API est à jour.[cite:23]
- Les impacts deliverability/compliance ont été vérifiés si la fonctionnalité touche l’envoi ou les données personnelles.[cite:26][cite:27][cite:29]

## Recommandation finale de cadrage

Le meilleur cadrage pour lancer ce produit est de viser une **V1 email-first, orientée exécution**, avec un cœur de données propre, un scoring explicable, une génération IA contrôlée, une inbox unifiée et un pipeline commercial léger.[cite:25][cite:28] Les exigences de délivrabilité et de conformité ne doivent pas être considérées comme des raffinements secondaires, mais comme des blocages structurants du système dès la première version.[cite:26][cite:27][cite:29]

Pour une agence comme Uprising Studio, la plus forte différenciation ne viendra probablement pas d’un clone générique d’outil de cold email, mais d’une plateforme combinant **prospection locale**, **audit prospect automatique**, **personnalisation orientée opportunité**, et **vision pipeline complète jusqu’au rendez-vous**.[cite:1][cite:2]
