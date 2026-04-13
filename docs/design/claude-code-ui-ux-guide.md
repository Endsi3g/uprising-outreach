# Guide de réplication du UI/UX de Claude Code

## Vue d’ensemble
Claude Code est présenté par Anthropic comme un outil de codage agentique capable de lire un codebase, modifier des fichiers, exécuter des commandes et s’intégrer aux outils de développement, ce qui explique que son interface soit pensée moins comme un simple chat et davantage comme une surface de travail orientée action et feedback système.[cite:1]
La navigation observable dans l’interface Claude met en avant une structure latérale persistante avec **Nouvelle conversation**, **Rechercher**, **Personnaliser**, **Discussions**, **Projets**, **Artéfacts** et **Code**, ce qui crée une sensation de produit mature, utilitaire et modulaire plutôt qu’une simple fenêtre conversationnelle.[cite:3]

## Ce qui rend l’expérience spéciale
La force de l’expérience Claude Code vient du couplage entre une interface minimaliste et une promesse d’autonomie élevée: Anthropic explique que Claude orchestre des outils, traite leurs sorties et contrôle le flux d’information qui entre dans son contexte, ce qui donne à l’utilisateur l’impression de collaborer avec un opérateur logiciel plutôt qu’avec un chatbot passif.[cite:2][cite:8]
Anthropic indique aussi avoir amélioré l’interface terminale de Claude Code avec une meilleure visibilité de statut et un historique de prompts consultable, ce qui montre que la qualité de l’expérience repose fortement sur la lisibilité de l’état courant, la continuité de session et la réutilisation rapide d’intentions précédentes.[cite:5]

## Piliers visuels à reproduire
Le ton visuel observé sur Claude repose sur une sobriété extrême: peu de couleurs, hiérarchie typographique discrète, surfaces très calmes, absence d’effets décoratifs excessifs et focalisation sur le champ d’action principal, ici le prompt composer.[cite:3]
Pour recréer cette vibe, il faut viser un design qui semble **confiant mais non démonstratif**: palette neutre, accent rare, composants arrondis mais retenus, espacements généreux, icônes fines, et sentiment d’outil premium plutôt que marketing. Cette approche contraste avec les interfaces IA génériques à gradients voyants et cartes répétitives, que des analyses de l’écosystème Claude décrivent précisément comme les motifs à éviter.[cite:10]

## Architecture de l’interface
La structure gagnante est un layout en trois logiques: **navigation permanente**, **zone de travail centrale**, **barre d’actions contextuelles**. L’interface Claude visible sur le web montre déjà cette logique avec une sidebar stable, un centre vide prêt à recevoir l’intention utilisateur, puis des options de mode et de sources près du champ de saisie.[cite:3]
Cette architecture réduit la charge cognitive, parce que l’utilisateur comprend immédiatement où commencer, où retrouver l’historique et où changer de mode sans quitter son flux.[cite:3][cite:5]

## Hiérarchie UX
L’expérience doit toujours répondre à quatre questions sans effort: où je suis, quoi faire maintenant, quel mode est actif, et quel système agit pour moi. La mention explicite du modèle actif comme **Sonnet 4.6**, la présence de modes comme **Code**, **Écrire** ou **Stratégiser**, et les options de sources comme Calendar ou Gmail illustrent cette hiérarchie d’état.[cite:3]
Un bon clone ne doit donc pas seulement copier le style visuel; il doit rendre chaque état système visible de façon calme, continue et prévisible.[cite:3][cite:5]

## Le composer
Le cœur du produit est le composer. Sur Claude, le champ d’entrée est traité comme la pièce maîtresse de l’interface avec une invitation claire à écrire, un environnement très peu encombré et des extensions adjacentes comme ajout de fichiers, connecteurs, mode vocal ou modes d’exécution.[cite:3]
Pour reproduire cela, le composer doit être large, respirer, accepter plusieurs types d’input, afficher les capacités disponibles sans bruit, et donner l’impression que tout part d’une intention unique pouvant ensuite se ramifier en actions système.[cite:3][cite:8]

## La sensation de collaboration
Claude Code se distingue parce qu’il n’est pas perçu comme une messagerie mais comme un partenaire opératoire. La documentation officielle insiste sur l’exécution d’actions concrètes dans le codebase et sur l’usage structuré d’outils, ce qui change totalement les attentes UX: l’utilisateur doit sentir qu’il délègue une tâche, observe un avancement, puis récupère un résultat exploitable.[cite:1][cite:8]
Cela implique une UX riche en **états transitoires lisibles**: analyse, planification, exécution, résultat, demande de permission, reprise, historique, artefacts générés.[cite:1][cite:5]

## Les ingrédients de la vibe visuelle
La vibe Claude peut être décrite comme un mélange de bureau créatif, d’outil développeur et de produit premium calme. Les indices visibles sont la neutralité chromatique, la forte lisibilité, la faible densité de distractions visuelles, et une organisation par modules simples plutôt que par cartes spectaculaires.[cite:3]
Visuellement, cela veut dire:
- Fond clair ou légèrement teinté, jamais blanc clinique pur ou noir agressif.[cite:3]
- Accent couleur très limité, réservé aux états actifs, confirmations ou focal points.[cite:3]
- Typographie sobre, moderne, très lisible, avec peu de contrastes inutiles.[cite:3]
- Icônes minimales, ligne fine, cohérentes sur toute l’interface.[cite:3]
- Rayons d’angle subtils, ombres légères, surfaces douces.[cite:3]

## Système de composants à prévoir
Pour approcher fidèlement l’expérience, un design system doit inclure au minimum:
- Sidebar avec éléments actifs/inactifs, compte, plan, raccourcis et sections de travail.[cite:3]
- Composer extensible avec pièces jointes, connecteurs, choix de mode, et état d’envoi/exécution.[cite:3]
- Badges ou pills de mode pour signaler le contexte actif, par exemple Code ou Écrire.[cite:3]
- Timeline d’actions ou journal de statut pour montrer ce que l’agent fait, surtout si des outils ou commandes sont impliqués.[cite:1][cite:5]
- Vues d’artefacts, projets et historiques, car ces éléments font partie de la promesse produit observable dans la navigation officielle.[cite:3]

## Motion et micro-interactions
L’expérience doit bouger peu, mais bien. Les améliorations officielles mises en avant par Anthropic concernent la visibilité de statut et l’historique consultable, donc les animations doivent soutenir la compréhension de l’état et non servir d’ornement.[cite:5]
Les transitions idéales sont courtes, fluides, quasi invisibles: apparition douce des états, survols retenus, focus states nets, expansion contrôlée des zones secondaires, et feedback immédiat lorsqu’un mode, une source ou un outil est activé.[cite:3][cite:5]

## Principes fonctionnels à copier
Le comportement compte autant que l’apparence. Claude distingue clairement les modes, les sources de contexte et les espaces de travail, ce qui aide l’utilisateur à construire une intention plus précise sans se perdre dans des menus complexes.[cite:3]
Un produit inspiré de Claude Code devrait donc intégrer:
- Un système de modes explicites.
- Des permissions ou validations visibles quand une action sensible est impliquée.
- Un historique robuste et retrouvable.
- Des artefacts ou sorties persistantes.
- Une séparation claire entre conversation, projet, recherche et exécution.[cite:3][cite:5][cite:8]

## Anti-patterns à éviter
Il ne faut surtout pas reproduire Claude Code avec les clichés habituels des apps IA: hero gradients, grosses cartes marketing, glow violets, centering excessif, icônes dans pastilles décoratives et surcharge d’animations. Des analyses récentes autour des pratiques UI avec Claude soulignent précisément que ces motifs produisent des interfaces génériques et dégradent la sensation de qualité.[cite:10]
Le bon repère est simple: si l’interface ressemble à une landing page SaaS générée automatiquement, elle s’éloigne de la vibe Claude Code.[cite:10]

## Spécification de réplication
### Direction artistique
- Minimalisme premium.
- Neutralité chaleureuse ou gris doux.
- Densité moyenne-faible.
- Typographie sans-serif propre, discrète, précise.
- Accent unique et rare.

### Layout
- Sidebar fixe à gauche.
- Zone centrale large avec beaucoup d’air.
- Composer collé au bas de la zone utile ou centré selon l’état vide.
- Panneaux secondaires contextuels seulement quand nécessaire.

### Typographie
- Taille de base confortable.
- Faible nombre de styles typographiques.
- Labels secondaires discrets.
- Très bon contraste, jamais dramatique.

### Couleurs
- 1 fond principal.
- 1 ou 2 surfaces.
- 1 couleur accent maximum.
- États système lisibles: succès, avertissement, erreur, actif.

### États UX
- Empty state accueillant mais sobre.
- Loading orienté statut.
- Tool running visible.
- Confirmation avant action sensible.
- Historique et reprise accessibles rapidement.

## Blueprint de page
| Zone | Rôle | Ce qu’il faut reproduire |
|---|---|---|
| Sidebar | Orientation | Historique, projets, recherche, personnalisation, artefacts, code.[cite:3] |
| Header léger | Contexte global | Compte, plan, réglages, parfois modèle actif.[cite:3] |
| Main canvas | Travail principal | Conversation, plan, résultats, artefacts, feedback d’exécution.[cite:1][cite:3] |
| Composer | Intention centrale | Input large, ajout de contexte, modes, actions, source connectors.[cite:3] |
| Status layer | Confiance | Progression, statut d’outil, permissions, historique consultable.[cite:5][cite:8] |

## Recommandations produit
Pour un clone crédible, il vaut mieux viser **l’interprétation fonctionnelle** de Claude Code plutôt qu’une copie pixel perfect. La documentation officielle montre que la valeur vient de l’agentivité, de l’intégration d’outils et de la clarté des états, donc le design doit d’abord faire sentir ces qualités.[cite:1][cite:8]
En pratique, la bonne feuille de route est:
1. Concevoir le système d’états avant le skin visuel.
2. Dessiner une sidebar persistante et un composer très fort.
3. Définir une palette neutre avec accent minimal.
4. Créer les vues d’historique, projets et artefacts.
5. Ajouter seulement ensuite les micro-interactions et raffinements premium.[cite:3][cite:5]

## Prompt de design utile
Voici un prompt de direction artistique réutilisable pour ton équipe ou un autre modèle:

> Concevoir une interface inspirée de Claude Code: minimalisme premium, sidebar persistante, grand espace de travail centré sur un composer intelligent, palette neutre chaleureuse, accent rare, hiérarchie calme, états système extrêmement lisibles, historique et artefacts persistants, sensation de collaborer avec un agent logiciel plutôt qu’avec un chatbot marketing. Éviter toute esthétique IA générique: gradients violets, glow, cartes répétitives, icônes décoratives, surcharge visuelle.

## Notes finales
L’observation directe de claude.ai confirme surtout la qualité de la structure, du calme visuel et de la hiérarchie fonctionnelle.[cite:3]
Les sources officielles d’Anthropic confirment que l’identité de Claude Code repose profondément sur l’usage d’outils, l’exécution d’actions concrètes et la lisibilité des états, ce qui doit rester le centre de toute tentative de réplication sérieuse.[cite:1][cite:5][cite:8]
