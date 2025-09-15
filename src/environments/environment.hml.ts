export const environment = {
    production: false,
    apiUrl: 'https://tw-system-api.onrender.com/api/v1',
    appName: 'TW-System Dev',
    // Configurações do Cloudinary (opcional para uso direto no frontend)
    cloudinary: {
        cloudName: 'your-cloud-name',
        // Não colocar API_KEY e API_SECRET no frontend por segurança!
        uploadPreset: 'tw-system-preset' // Preset não assinado para upload direto
    }
};