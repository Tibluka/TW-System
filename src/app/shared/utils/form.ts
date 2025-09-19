import { FormControl } from "@angular/forms";

export class FormValidator {
    isFormControlInvalid(formControl: FormControl) {
        return formControl?.invalid && formControl?.touched;
    }
}