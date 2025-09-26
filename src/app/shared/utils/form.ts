
export class FormValidator {
    isFormControlInvalid(formControl: any) {
        return formControl?.invalid && formControl?.touched;
    }
}
