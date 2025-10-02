import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';

import { CreateDeliverySheetRequest, DeliverySheet, UpdateDeliverySheetRequest } from '../../../../models/delivery-sheets/delivery-sheets';
import { DeliverySheetsService } from '../../../../shared/services/delivery-sheets/delivery-sheets.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { ProductionSheet, ProductionSheetsService } from '../../../../shared/services/production-sheets/production-sheets.service';
import { ProductionOrderStatus } from '../../../../models/production-orders/production-orders';
import { ProductionTypeEnum } from '../../../../models/production-type';

import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';

import { DateFormatter } from '../../../../shared/utils/date-formatter';
import { FormValidator } from '../../../../shared/utils/form';

import { ProductionSheetResponse } from '../../../../models/production-sheet/production-sheet';

@Component({
    selector: 'app-delivery-sheet-modal',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonComponent,
        InputComponent,
        TextareaComponent,
        SpinnerComponent,
        IconComponent,
        FormsModule
    ],
    providers: [
        NgModel
    ],
    templateUrl: './delivery-sheet-modal.component.html',
    styleUrl: './delivery-sheet-modal.component.scss'
})
export class DeliverySheetModalComponent extends FormValidator implements OnInit, OnDestroy {
    @Input() deliverySheetId?: string;
    @Input() clients: any[] = [];

    private formBuilder = inject(FormBuilder);
    private modalService = inject(ModalService);
    private deliverySheetsService = inject(DeliverySheetsService);
    private productionSheetsService = inject(ProductionSheetsService);
    private cdr = inject(ChangeDetectorRef);


    deliverySheetForm!: FormGroup;
    isEditMode = false;
    isSaving = false;
    isLoading = false;


    searchingProductionSheet = false;
    productionSheetFound: ProductionSheet | null = null;
    productionSheetNotFound = false;


    private destroy$ = new Subject<void>();
    private searchProductionSheetSubject = new Subject<string>();


    ngOnInit(): void {
        this.initializeForm();
        this.initializeProductionSheetSearch();

        setTimeout(() => {
            this.loadRelatedData();
        }, 100);


        const activeModal = this.modalService.activeModal();
        if (activeModal?.config.data && activeModal.config.data.mode !== 'create') {
            const deliverySheet = activeModal.config.data;
            this.isEditMode = true;
            this.populateFormFromData(deliverySheet);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    /**
     * 📋 INICIALIZAR FORMULÁRIO - Configura o formulário reativo
     */
    private initializeForm(): void {
        const formConfig: any = {
            internalReference: ['', [Validators.required]],
            totalValue: ['', [Validators.required, Validators.min(0)]],
            notes: ['', [Validators.maxLength(1000)]],
            invoiceNumber: ['', [Validators.maxLength(50)]],
            deliveryDate: [this.getTodayDateString()],
            address: this.formBuilder.group({
                street: ['', [Validators.required, Validators.minLength(10)]],
                number: ['', [Validators.required]],
                city: ['', [Validators.required, Validators.minLength(2)]],
                state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
                zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
                complement: [''],
                neighborhood: ['']
            })
        };

        this.deliverySheetForm = this.formBuilder.group(formConfig);
    }

    /**
     * 📊 CARREGAR DADOS RELACIONADOS - Removido: não é mais necessário
     */
    private loadRelatedData(): void {

    }

    /**
     * 🔍 INICIALIZAR BUSCA - Configura debounce para busca de ficha de produção
     */
    private initializeProductionSheetSearch(): void {
        this.searchProductionSheetSubject
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe(internalReference => {
                if (internalReference && internalReference.length >= 3) {
                    this.searchProductionSheet(internalReference);
                } else {
                    this.resetProductionSheetSearch();
                }
            });
    }

    /**
     * 🔍 BUSCAR FICHA DE PRODUÇÃO - Busca ficha de produção por referência interna
     */
    private async searchProductionSheet(internalReference: string): Promise<void> {
        this.searchingProductionSheet = true;
        this.productionSheetNotFound = false;

        try {
            const response: ProductionSheetResponse = await lastValueFrom(
                this.productionSheetsService.getProductionSheetByInternalReference(internalReference)
            );

            if (response.data) {
                this.productionSheetFound = response.data;
                this.populateAddressFromClient();
            } else {
                this.productionSheetNotFound = true;
                this.productionSheetFound = null;
            }
        } catch (error) {
            this.productionSheetNotFound = true;
            this.productionSheetFound = null;
        } finally {
            this.searchingProductionSheet = false;
            this.cdr.detectChanges();
        }
    }

    /**
     * 🔄 RESETAR BUSCA - Limpa estado da busca de ficha de produção
     */
    private resetProductionSheetSearch(): void {
        this.productionSheetFound = null;
        this.productionSheetNotFound = false;
        this.searchingProductionSheet = false;
    }

    /**
     * 🏠 PREENCHER ENDEREÇO - Preenche automaticamente o endereço com dados do cliente
     */
    private populateAddressFromClient(): void {
        if (!this.productionSheetFound?.productionOrder?.development?.client?.address) {
            return;
        }

        const clientAddress = this.productionSheetFound.productionOrder.development.client.address;

        this.deliverySheetForm.patchValue({
            address: {
                street: clientAddress.street,
                number: clientAddress.number,
                city: clientAddress.city,
                state: clientAddress.state,
                zipCode: clientAddress.zipcode,
                complement: clientAddress.complement || '',
                neighborhood: clientAddress.neighborhood
            }
        });
    }

    /**
     * 📄 CARREGAR FICHA DE ENTREGA - Carrega dados para edição
     */
    private async loadDeliverySheet(): Promise<void> {
        if (!this.deliverySheetId) return;

        try {
            const response = await this.deliverySheetsService.getDeliverySheetById(this.deliverySheetId).toPromise();

            if (response?.success && response.data) {
                this.populateForm(response.data);
            } else {
                this.showErrorMessage('Erro ao carregar ficha de entrega.');
                this.closeModal('error');
            }
        } catch (error: any) {
            this.showErrorMessage(error.message || 'Erro ao carregar ficha de entrega.');
            this.closeModal('error');
        }
    }

    /**
     * 📋 POPULAR FORMULÁRIO COM DADOS DO MODAL - Preenche dados da ficha de entrega para edição
     */
    private populateFormFromData(deliverySheet: any): void {
        if (deliverySheet.productionSheet) {
            this.productionSheetFound = deliverySheet.productionSheet;
            this.deliverySheetForm.get('internalReference')?.disable();
            this.productionSheetNotFound = false;
            this.searchingProductionSheet = false;


        }


        this.deliverySheetForm.patchValue({
            internalReference: deliverySheet.internalReference || '',
            totalValue: deliverySheet.totalValue || 0,
            notes: deliverySheet.notes || '',
            invoiceNumber: deliverySheet.invoiceNumber || '',
            deliveryDate: this.formatDateForInput(deliverySheet.deliveryDate),
            address: {
                street: deliverySheet.address?.street || '',
                number: deliverySheet.address?.number || '',
                city: deliverySheet.address?.city || '',
                state: deliverySheet.address?.state || '',
                zipCode: deliverySheet.address?.zipCode || '',
                complement: deliverySheet.address?.complement || '',
                neighborhood: deliverySheet.address?.neighborhood || ''
            }
        });


        if (deliverySheet._id) {
            this.deliverySheetForm.addControl('_id', this.formBuilder.control(deliverySheet._id));
        }
    }

    /**
     * 📝 POPULAR FORMULÁRIO - Preenche formulário com dados da ficha
     */
    private populateForm(deliverySheet: DeliverySheet): void {
        if (deliverySheet.productionSheet) {
            this.productionSheetFound = deliverySheet.productionSheet;
            this.productionSheetNotFound = false;
            this.searchingProductionSheet = false;
        }

        this.deliverySheetForm.patchValue({
            internalReference: deliverySheet.internalReference,
            totalValue: deliverySheet.totalValue || 0,
            notes: deliverySheet.notes || '',
            invoiceNumber: deliverySheet.invoiceNumber || '',
            deliveryDate: this.formatDateForInput(deliverySheet.deliveryDate),
            address: {
                street: deliverySheet.address?.street || '',
                number: deliverySheet.address?.number || '',
                city: deliverySheet.address?.city || '',
                state: deliverySheet.address?.state || '',
                zipCode: deliverySheet.address?.zipCode || '',
                complement: deliverySheet.address?.complement || '',
                neighborhood: deliverySheet.address?.neighborhood || ''
            }
        });
    }


    /**
     * 🔍 BUSCA DE FICHA DE PRODUÇÃO - Evento quando usuário digita referência
     */
    onInternalReferenceChange(): void {
        const internalReference = this.deliverySheetForm.get('internalReference')?.value;
        if (internalReference) {
            this.searchProductionSheetSubject.next(internalReference);
        } else {
            this.resetProductionSheetSearch();
        }
    }


    /**
     * 💾 SALVAR - Salva ou atualiza ficha de entrega
     */
    async onSubmit(): Promise<void> {
        this.deliverySheetForm.markAllAsTouched();

        if (this.deliverySheetForm.invalid) {
            return;
        }

        this.isSaving = true;

        try {
            const formData = this.deliverySheetForm.value;

            if (this.isEditMode && (this.deliverySheetId || formData._id)) {
                const updateData: UpdateDeliverySheetRequest = {
                    productionSheetId: this.productionSheetFound?._id || '',
                    totalValue: parseFloat(formData.totalValue) || 0,
                    notes: formData.notes || undefined,
                    invoiceNumber: formData.invoiceNumber || undefined,
                    deliveryDate: formData.deliveryDate ? DateFormatter.formatDateToISO(formData.deliveryDate) : undefined,
                    address: {
                        street: formData.address.street,
                        number: formData.address.number,
                        city: formData.address.city,
                        state: formData.address.state,
                        zipCode: formData.address.zipCode,
                        complement: formData.address.complement || undefined,
                        neighborhood: formData.address.neighborhood || undefined
                    }
                };

                const response = await lastValueFrom(
                    this.deliverySheetsService.updateDeliverySheet(this.deliverySheetId || formData._id, updateData)
                );

                if (response?.success) {
                    this.closeModal('updated', response.data);
                } else {
                    throw new Error(response?.message || 'Erro ao atualizar ficha de entrega');
                }
            } else {
                const createData: CreateDeliverySheetRequest = {
                    productionSheetId: this.productionSheetFound?._id || '',
                    totalValue: parseFloat(formData.totalValue) || 0,
                    notes: formData.notes || undefined,
                    invoiceNumber: formData.invoiceNumber || undefined,
                    deliveryDate: formData.deliveryDate ? DateFormatter.formatDateToISO(formData.deliveryDate) : undefined,
                    address: {
                        street: formData.address.street,
                        number: formData.address.number,
                        city: formData.address.city,
                        state: formData.address.state,
                        zipCode: formData.address.zipCode,
                        complement: formData.address.complement || undefined,
                        neighborhood: formData.address.neighborhood || undefined
                    }
                };

                const response = await lastValueFrom(
                    this.deliverySheetsService.createDeliverySheet(createData)
                );

                if (response?.success) {
                    this.closeModal('created', response.data);
                } else {
                    throw new Error(response?.message || 'Erro ao criar ficha de entrega');
                }
            }
        } catch (error: any) {
            this.showErrorMessage(error.message || 'Erro ao salvar ficha de entrega.');
        } finally {
            this.isSaving = false;
        }
    }

    /**
     * ❌ CANCELAR - Fecha modal sem salvar
     */
    onCancel(): void {
        this.closeModal('cancelled');
    }

    /**
     * 🔒 FECHAR MODAL - Fecha modal com resultado
     */
    private closeModal(action: string, data?: any): void {
        this.modalService.close('delivery-sheet-modal', {
            action,
            data
        });
    }

    /**
     * 📅 OBTER DATA DE HOJE - Retorna data de hoje no formato de input
     */
    private getTodayDateString(): string {
        return DateFormatter.getTodayDateString();
    }

    /**
     * 📅 FORMATAR DATA PARA INPUT - Converte data para formato de input HTML
     */
    private formatDateForInput(date: Date | string): string {
        return DateFormatter.formatDateForInput(date);
    }

    /**
     * ❌ MOSTRAR MENSAGEM DE ERRO
     */
    private showErrorMessage(message: string): void {

    }

    /**
     * 🔍 OBTER ERRO DO CAMPO - Retorna mensagem de erro para campo específico
     */
    getFieldError(fieldName: string): string {
        const field = this.deliverySheetForm.get(fieldName);
        if (field && field.errors && field.touched) {
            if (field.errors['required']) {
                return 'Este campo é obrigatório';
            }
            if (field.errors['minlength']) {
                return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
            }
            if (field.errors['maxlength']) {
                return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
            }
            if (field.errors['pattern']) {
                return 'Formato inválido';
            }
            if (field.errors['min']) {
                return `Valor mínimo: ${field.errors['min'].min}`;
            }
        }
        return '';
    }

    /**
     * 🏷️ LABEL ESTÁGIO - Retorna label em português para estágio
     */
    getStageLabel(stage: string): string {
        return this.productionSheetsService.getStageLabel(stage as any);
    }

    /**
     * 🖥️ NOME DA MÁQUINA - Retorna nome formatado da máquina
     */
    getMachineName(machineNumber: number): string {
        return this.productionSheetsService.getMachineName(machineNumber as any);
    }

    /**
     * 📅 FORMATAR DATA - Formata data para exibição
     */
    formatDate(date: Date | string | undefined): string {
        return this.productionSheetsService.formatDate(date);
    }

    /**
     * 🏷️ LABEL STATUS ORDEM DE PRODUÇÃO - Retorna label em português para status
     */
    getProductionOrderStatusLabel(status: ProductionOrderStatus): string {
        const statusMap: { [key in ProductionOrderStatus]: string } = {
            'CREATED': 'Criado',
            'PILOT_PRODUCTION': 'Produção Piloto',
            'PILOT_SENT': 'Piloto Enviado',
            'PILOT_APPROVED': 'Piloto Aprovado',
            'PRODUCTION_STARTED': 'Produção Iniciada',
            'FINALIZED': 'Finalizado'
        };
        return statusMap[status] || status;
    }

    /**
     * 🏷️ LABEL TIPO DE PRODUÇÃO - Retorna label em português para tipo de produção
     */
    getProductionTypeLabel(type: ProductionTypeEnum | undefined): string {
        if (!type) return '-';
        const typeMap: { [key in ProductionTypeEnum]: string } = {
            'rotary': 'Rotativa',
            'localized': 'Localizada'
        };
        return typeMap[type] || type;
    }

    /**
     * 📊 TOTAL DE PEÇAS - Calcula total de peças para produção localizada
     */
    getTotalPieces(productionType: any): string {
        if (!productionType || productionType.type !== 'localized' || !productionType.variants) {
            return '0';
        }

        let total = 0;
        productionType.variants.forEach((variant: any) => {
            if (variant.quantities && Array.isArray(variant.quantities)) {
                variant.quantities.forEach((quantity: any) => {
                    total += quantity.value || 0;
                });
            }
        });

        return `${total} pç${total !== 1 ? 's' : ''}`;
    }

    /**
     * 🧵 TIPO DE TECIDO - Retorna o tipo de tecido baseado no tipo de produção
     */
    getFabricType(productionOrder: any): string {
        if (!productionOrder) return '-';


        if (productionOrder.productionType?.type === 'rotary') {
            return productionOrder.productionType.fabricType || productionOrder.fabricType || '-';
        }


        if (productionOrder.productionType?.type === 'localized' && productionOrder.productionType.variants) {
            const fabricTypes = productionOrder.productionType.variants
                .map((variant: any) => variant.fabricType)
                .filter((type: any) => type && typeof type === 'string' && type.trim() !== '');

            const uniqueFabricTypes = [...new Set(fabricTypes)];

            if (uniqueFabricTypes.length === 0) return '-';
            if (uniqueFabricTypes.length === 1) return uniqueFabricTypes[0] as string;
            return 'Vários tipos';
        }


        return productionOrder.fabricType || '-';
    }
}
