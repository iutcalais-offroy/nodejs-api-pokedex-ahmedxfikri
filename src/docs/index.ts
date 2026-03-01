import YAML from 'yamljs';
import path from 'path';

/**
 * Agrège et fusionne toutes les documentations Swagger/OpenAPI
 * Combine la configuration principale avec les documentation par module
 */
export const generateSwaggerSpec = () => {
  try {
    // Charger le fichier de configuration principal
    const configPath = path.join(__dirname, 'swagger.config.yml');
    const swaggerConfig = YAML.load(configPath);

    // Charger les documentations par module
    const authDocPath = path.join(__dirname, 'auth.doc.yml');
    const cardDocPath = path.join(__dirname, 'card.doc.yml');
    const deckDocPath = path.join(__dirname, 'deck.doc.yml');

    const authDoc = YAML.load(authDocPath);
    const cardDoc = YAML.load(cardDocPath);
    const deckDoc = YAML.load(deckDocPath);

    // Fusionner les paths de tous les modules
    swaggerConfig.paths = {
      ...swaggerConfig.paths,
      ...authDoc.paths,
      ...cardDoc.paths,
      ...deckDoc.paths,
    };

    return swaggerConfig;
  } catch (error) {
    console.error('Erreur lors de la génération de la spécification Swagger:', error);
    throw error;
  }
};