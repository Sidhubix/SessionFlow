import React from 'react';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-300 dark:border-gray-700 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400">Mentions Légales & Politique de Confidentialité</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <XIcon />
          </button>
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none max-h-[70vh] overflow-y-auto pr-4 text-gray-700 dark:text-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">1. Informations Générales</h3>
          <p>
            Cette application, "Tableau de Bord de l'Enseignant", est un outil conçu pour aider les enseignants à visualiser et gérer leur emploi du temps.
          </p>
          <p>
            <strong>Éditeur du site :</strong> Eric OU<br />
            <strong>Outil de développement assisté :</strong> Google AI Studio<br />
            <strong>Contact :</strong> Pour toute question, veuillez utiliser les canaux de communication fournis par la plateforme de distribution.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">2. Hébergement</h3>
          <p>
            L'application est une application web progressive (PWA) qui s'exécute entièrement côté client, dans votre navigateur web. Aucune donnée personnelle ou d'emploi du temps n'est envoyée ou stockée sur un serveur distant appartenant à l'éditeur. L'hébergement des fichiers statiques de l'application est assuré par la plateforme Google AI Studio.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">3. Propriété Intellectuelle</h3>
          <p>
            Le code source, le design et la structure de l'application sont la propriété intellectuelle de leur auteur. Toute reproduction ou distribution non autorisée est interdite.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">4. Limitation de Responsabilité</h3>
          <p>
            L'application est fournie "en l'état" sans aucune garantie. L'éditeur ne pourra être tenu responsable des erreurs, omissions, ou des résultats obtenus suite à l'utilisation des informations fournies par l'application. L'utilisateur est seul responsable de la vérification des données importées (fichiers .ics) et des interprétations qu'il en fait.
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">5. Politique de Confidentialité (RGPD)</h3>
          <p>
            La protection de vos données personnelles est notre priorité.
          </p>
          <ul>
            <li>
              <strong>Collecte de données :</strong> L'application ne collecte, ne transmet et ne stocke aucune donnée personnelle sur des serveurs externes. Toutes les données traitées, y compris le contenu de vos fichiers d'emploi du temps (.ics) et de vos sessions sauvegardées (.json), restent exclusivement sur votre ordinateur, au sein de votre navigateur.
            </li>
            <li>
              <strong>Traitement des données :</strong> Le traitement des données de votre emploi du temps est effectué localement par votre navigateur. Ces informations sont nécessaires pour générer le tableau de bord et ne sont jamais accessibles par l'éditeur ou des tiers.
            </li>
            <li>
              <strong>Stockage des données :</strong> Les seules informations potentiellement stockées dans votre navigateur sont les préférences de thème (clair/sombre/système) via le `localStorage`. Les données de session complètes ne sont pas stockées automatiquement ; vous avez le contrôle total via les fonctions d'exportation et d'importation de fichiers .json.
            </li>
            <li>
              <strong>Vos droits :</strong> Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Étant donné que les données sont stockées localement, vous pouvez exercer ces droits de la manière suivante :
              <ul>
                  <li><strong>Accès et Rectification :</strong> Vous pouvez accéder à vos données en chargeant votre fichier .ics ou en important votre fichier de sauvegarde .json. La rectification se fait en modifiant le fichier source.</li>
                  <li><strong>Suppression :</strong> Vous pouvez supprimer vos données à tout moment en effaçant les fichiers (.ics, .json) de votre disque dur et en vidant le cache de votre navigateur pour ce site.</li>
              </ul>
            </li>
             <li>
              <strong>Cookies :</strong> Cette application n'utilise pas de cookies de suivi ou publicitaires. Seul le `localStorage` du navigateur est utilisé pour des fonctionnalités essentielles comme la sauvegarde du thème d'affichage.
            </li>
          </ul>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
