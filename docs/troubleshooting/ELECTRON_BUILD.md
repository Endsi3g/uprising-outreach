# Guide de Résolution : Build Electron pour ProspectOS

Ce document répertorie les erreurs courantes rencontrées lors de la génération de l'exécutable (`.exe`) et comment les résoudre.

## 1. Export Statique (`output: 'export'`)

Pour qu'Electron puisse charger l'application via le protocole `file://`, Next.js doit être configuré en mode **static export**.

> [!IMPORTANT]
> Vérifiez `frontend/next.config.ts` :
> ```typescript
> const nextConfig: NextConfig = {
>   output: 'export',
>   // ...
> };
> ```

## 2. Routes Dynamiques (`[id]`)

Les routes dynamiques comme `/projects/[id]` ne fonctionnent pas nativement avec l'export statique si elles ne sont pas pré-générées au build.

**Problème** : Erreur `Page "/projects/[id]" is missing "generateStaticParams()"`.
**Solution** : Utiliser des paramètres de recherche (query params).
- Renommer `projects/[id]/page.tsx` en `projects/details/page.tsx`.
- Utiliser `useSearchParams()` pour récupérer l'ID :
  ```typescript
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  ```

## 3. Suspense Boundary pour searchParams

L'utilisation de `useSearchParams()` dans un export statique nécessite que le composant soit enveloppé dans une frontière `<Suspense>`.

**Problème** : Erreur de pré-rendu lors de l'export.
**Solution** : 
```typescript
export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ProjectDetailContent />
    </Suspense>
  );
}
```

## 4. Erreurs de Type (TypeScript)

Next.js bloque le build si des erreurs de type sont présentes.

**Problèmes fréquents** :
- **ThemeMode** : `setTheme` attend `"light" | "dark" | "auto"`. Vérifiez que vous n'envoyez pas une chaîne générique comme `"system"`.
- **Badge Props** : Assurez-vous d'utiliser `color` au lieu de `variant` si le composant UI a été modifié.

## 5. Mismatch de Build ID & Cache Stale

Si vous rencontrez des erreurs `ENOENT` (fichier non trouvé) lors de l'étape `electron-builder`, c'est souvent dû à un cache corrompu.

**Solution** : Nettoyage complet avant le build.
```powershell
# Commande recommandée
Remove-Item -LiteralPath "out", ".next", "dist" -Recurse -Force -ErrorAction SilentlyContinue; npm run build:electron
```

## 7. Erreur de Symlink (Permissions Windows)

Lors de l'extraction des outils de signature (`winCodeSign`), `electron-builder` peut échouer car il tente de créer des liens symboliques pour macOS alors que vous êtes sur Windows.

**Problème** : `ERROR: Cannot create symbolic link : Le client ne dispose pas d'un privilège nécessaire.`
**Solution** : 
- Désactivez temporairement la signature de code si elle n'est pas configurée.
- Exécutez le script avec des variables d'environnement pour ignorer la signature :
  ```powershell
  $env:CSC_LINK=$null; $env:WIN_CSC_LINK=$null; npm run build:electron
  ```
- Ou activez le **Mode Développeur** dans les paramètres de Windows (Windows Settings > Privacy & Security > For developers > Developer Mode).
