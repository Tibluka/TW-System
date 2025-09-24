export function copyToClipboard(internalReference: string, event?: MouseEvent) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText(internalReference).then(() => {
            //alert('copiado com sucesso')
        }).catch(err => {
            alert('Erro ao copiar')
        });
    }
}