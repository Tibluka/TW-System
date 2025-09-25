import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StatusUpdaterComponent, StatusOption } from './status-updater.component';

describe('StatusUpdaterComponent', () => {
    let component: StatusUpdaterComponent;
    let fixture: ComponentFixture<StatusUpdaterComponent>;

    const mockStatusOptions: StatusOption[] = [
        { value: 'CREATED', label: 'Criado', icon: 'fa-solid fa-plus' },
        { value: 'IN_PROGRESS', label: 'Em Progresso', icon: 'fa-solid fa-play' },
        { value: 'COMPLETED', label: 'Concluído', icon: 'fa-solid fa-check' },
        { value: 'CANCELLED', label: 'Cancelado', icon: 'fa-solid fa-times', disabled: true }
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatusUpdaterComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(StatusUpdaterComponent);
        component = fixture.componentInstance;

        // Configurar inputs padrão para os testes
        component.entityType = 'development';
        component.entityId = 'test-id';
        component.currentStatus = 'CREATED';
        component.availableStatuses = mockStatusOptions;
        component.entityReference = 'TEST-001';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open modal when openStatusModal is called', () => {
        component.openStatusModal();
        expect(component.isModalOpen).toBe(true);
        expect(component.selectedStatus).toBe('CREATED');
    });

    it('should close modal when closeModal is called', () => {
        component.isModalOpen = true;
        component.selectedStatus = 'IN_PROGRESS';
        component.isLoading = true;
        component.errorMessage = 'Test error';

        component.closeModal();

        expect(component.isModalOpen).toBe(false);
        expect(component.selectedStatus).toBe('');
        expect(component.isLoading).toBe(false);
        expect(component.errorMessage).toBe('');
    });

    it('should select status when selectStatus is called with valid status', () => {
        component.openStatusModal();
        component.selectStatus('IN_PROGRESS');

        expect(component.selectedStatus).toBe('IN_PROGRESS');
        expect(component.errorMessage).toBe('');
    });

    it('should not select status if it is disabled', () => {
        component.openStatusModal();
        const initialStatus = component.selectedStatus;

        component.selectStatus('CANCELLED'); // Status disabled

        expect(component.selectedStatus).toBe(initialStatus);
    });

    it('should not select current status', () => {
        component.openStatusModal();
        const initialStatus = component.selectedStatus;

        component.selectStatus('CREATED'); // Current status

        expect(component.selectedStatus).toBe(initialStatus);
    });

    it('should return correct status label', () => {
        const label = component.getStatusLabel('IN_PROGRESS');
        expect(label).toBe('Em Progresso');
    });

    it('should return status value as label if not found in options', () => {
        const label = component.getStatusLabel('UNKNOWN_STATUS');
        expect(label).toBe('UNKNOWN_STATUS');
    });

    it('should return correct status color', () => {
        const color = component.getStatusColor('IN_PROGRESS');
        expect(color).toBe('primary'); // Default color
    });

    it('should return correct status icon', () => {
        const icon = component.getStatusIcon('CREATED');
        expect(icon).toBe('fa-solid fa-plus');
    });

    it('should return empty string for icon if not found', () => {
        const icon = component.getStatusIcon('UNKNOWN_STATUS');
        expect(icon).toBe('');
    });

    it('should check if status is selected correctly', () => {
        component.selectedStatus = 'IN_PROGRESS';

        expect(component.isStatusSelected('IN_PROGRESS')).toBe(true);
        expect(component.isStatusSelected('CREATED')).toBe(false);
    });

    it('should check if status is disabled correctly', () => {
        expect(component.isStatusDisabled('CANCELLED')).toBe(true);
        expect(component.isStatusDisabled('CREATED')).toBe(false);
    });

    it('should return correct modal title for development', () => {
        component.entityType = 'development';
        component.entityReference = 'DEV-001';

        const title = component.getModalTitle();
        expect(title).toBe('Alterar Status do Desenvolvimento - DEV-001');
    });

    it('should return correct modal title for production-order', () => {
        component.entityType = 'production-order';
        component.entityReference = 'PO-001';

        const title = component.getModalTitle();
        expect(title).toBe('Alterar Status da Ordem de Produção - PO-001');
    });

    it('should return correct modal title for production-sheet', () => {
        component.entityType = 'production-sheet';
        component.entityReference = 'PS-001';

        const title = component.getModalTitle();
        expect(title).toBe('Alterar Status da Ficha de Produção - PS-001');
    });

    it('should emit statusUpdated when confirmUpdate is called successfully', async () => {
        spyOn(component.statusUpdated, 'emit');

        component.openStatusModal();
        component.selectStatus('IN_PROGRESS');

        // Mock do método updateEntityStatus para retornar sucesso
        spyOn(component as any, 'updateEntityStatus').and.returnValue(Promise.resolve({}));

        await component.confirmUpdate();

        expect(component.statusUpdated.emit).toHaveBeenCalledWith({
            success: true,
            newStatus: 'IN_PROGRESS',
            message: 'Status atualizado com sucesso para: Em Progresso'
        });
        expect(component.isModalOpen).toBe(false);
    });

    it('should emit statusUpdateFailed when confirmUpdate fails', async () => {
        spyOn(component.statusUpdateFailed, 'emit');

        component.openStatusModal();
        component.selectStatus('IN_PROGRESS');

        // Mock do método updateEntityStatus para retornar erro
        spyOn(component as any, 'updateEntityStatus').and.returnValue(Promise.reject(new Error('API Error')));

        await component.confirmUpdate();

        expect(component.statusUpdateFailed.emit).toHaveBeenCalledWith({
            success: false,
            newStatus: 'CREATED',
            error: 'API Error'
        });
        expect(component.errorMessage).toBe('API Error');
        expect(component.isLoading).toBe(false);
    });
});
