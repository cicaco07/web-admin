import { alertConfirm, alertError, alertSuccess } from '../alert';
import {
  useCreateBattlefieldPatchNote,
  useCreateGameModePatchNote,
  useCreateHeroPatchNote,
  useCreatePatchNote,
  useCreateSystemPatchNote,
  useRemoveBattlefieldPatchNote,
  useRemoveGameModePatchNote,
  useRemoveHeroPatchNote,
  useRemovePatchNote,
  useRemoveSystemPatchNote,
  useUpdateBattlefieldPatchNote,
  useUpdateGameModePatchNote,
  useUpdateHeroPatchNote,
  useUpdatePatchNote,
  useUpdateSystemPatchNote,
} from '../api/PatchNoteApi';
import type { HeroPatchNoteFormData, PatchNoteFormData, SimplePatchNoteSectionFormData } from '../../types/PatchNote';

interface BootstrapModalApi { getOrCreateInstance(element: HTMLElement | null): { hide(): void } }
interface WindowWithBootstrap extends Window { bootstrap?: { Modal?: BootstrapModalApi } }

const hideModal = (id: string) => {
  (window as WindowWithBootstrap).bootstrap?.Modal?.getOrCreateInstance(document.getElementById(id))?.hide();
};

const parseDetails = (value: string): Record<string, unknown> => {
  if (!value.trim()) return {};
  const parsed: unknown = JSON.parse(value);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : { value: parsed };
};

export const usePatchNoteService = (refetch: () => Promise<unknown>) => {
  const token = localStorage.getItem('token') || '';
  const { createPatchNote } = useCreatePatchNote(token);
  const { updatePatchNote } = useUpdatePatchNote(token);
  const { removePatchNote } = useRemovePatchNote(token);
  const { createHeroPatchNote } = useCreateHeroPatchNote(token);
  const { updateHeroPatchNote } = useUpdateHeroPatchNote(token);
  const { removeHeroPatchNote } = useRemoveHeroPatchNote(token);
  const { createBattlefieldPatchNote } = useCreateBattlefieldPatchNote(token);
  const { updateBattlefieldPatchNote } = useUpdateBattlefieldPatchNote(token);
  const { removeBattlefieldPatchNote } = useRemoveBattlefieldPatchNote(token);
  const { createSystemPatchNote } = useCreateSystemPatchNote(token);
  const { updateSystemPatchNote } = useUpdateSystemPatchNote(token);
  const { removeSystemPatchNote } = useRemoveSystemPatchNote(token);
  const { createGameModePatchNote } = useCreateGameModePatchNote(token);
  const { updateGameModePatchNote } = useUpdateGameModePatchNote(token);
  const { removeGameModePatchNote } = useRemoveGameModePatchNote(token);

  const handleAddPatchNote = async (form: PatchNoteFormData) => {
    try {
      await createPatchNote({ createPatchNoteInput: { ...form, season: Number(form.season) } });
      await refetch();
      alertSuccess('Patch note berhasil ditambahkan!');
      hideModal('add-patch-note');
    } catch (error) { alertError('Gagal menambahkan patch note.'); throw error; }
  };

  const handleEditPatchNote = async (form: PatchNoteFormData) => {
    try {
      if (!form._id) throw new Error('Missing patch note id');
      const { _id, ...updatePatchNoteInput } = form;
      await updatePatchNote({ id: _id, updatePatchNoteInput: { ...updatePatchNoteInput, season: Number(updatePatchNoteInput.season) } });
      await refetch();
      alertSuccess('Patch note berhasil diupdate!');
      hideModal('edit-patch-note');
    } catch (error) { alertError('Gagal mengupdate patch note.'); throw error; }
  };

  const handleDeletePatchNote = async (id: string) => {
    if (await alertConfirm('Yakin ingin menghapus patch note ini?')) {
      await removePatchNote({ id });
      await refetch();
      alertSuccess('Patch note berhasil dihapus!');
    }
  };

  const handleAddHeroPatchNote = async (form: HeroPatchNoteFormData) => {
    try {
      const { patchNoteId, _id, ...createHeroPatchNoteInput } = form;
      await createHeroPatchNote({ patchNoteId, createHeroPatchNoteInput });
      await refetch();
      alertSuccess('Hero patch berhasil ditambahkan!');
      hideModal('add-hero-patch-note');
    } catch (error) { alertError('Gagal menyimpan hero patch.'); throw error; }
  };

  const handleEditHeroPatchNote = async (form: HeroPatchNoteFormData) => {
    try {
      if (!form._id) throw new Error('Missing hero patch id');
      const { _id, patchNoteId, ...updateHeroPatchNoteInput } = form;
      await updateHeroPatchNote({ id: _id, updateHeroPatchNoteInput });
      await refetch();
      alertSuccess('Hero patch berhasil diupdate!');
      hideModal('edit-hero-patch-note');
    } catch (error) { alertError('Gagal mengupdate hero patch.'); throw error; }
  };

  const handleDeleteHeroPatchNote = async (id: string) => {
    if (await alertConfirm('Yakin ingin menghapus hero patch ini?')) { await removeHeroPatchNote({ id }); await refetch(); alertSuccess('Hero patch berhasil dihapus!'); }
  };

  const simplePayload = (form: SimplePatchNoteSectionFormData) => ({ title: form.title, description: form.description, change_details: parseDetails(form.change_details) });

  const handleAddSimpleSection = async (kind: 'battlefield' | 'system' | 'gameMode', form: SimplePatchNoteSectionFormData) => {
    try {
      const variables = { patchNoteId: form.patchNoteId };
      const input = simplePayload(form);
      if (kind === 'battlefield') await createBattlefieldPatchNote({ ...variables, createBattlefieldPatchNoteInput: input });
      if (kind === 'system') await createSystemPatchNote({ ...variables, createSystemPatchNoteInput: input });
      if (kind === 'gameMode') await createGameModePatchNote({ ...variables, createGameModePatchNoteInput: input });
      await refetch();
      alertSuccess('Data patch berhasil ditambahkan!');
      hideModal(`add-${kind}-patch-note`);
    } catch (error) { alertError('Gagal menyimpan data patch. Pastikan JSON valid.'); throw error; }
  };

  const handleEditSimpleSection = async (kind: 'battlefield' | 'system' | 'gameMode', form: SimplePatchNoteSectionFormData) => {
    try {
      if (!form._id) throw new Error('Missing patch section id');
      const id = form._id;
      const input = simplePayload(form);
      if (kind === 'battlefield') await updateBattlefieldPatchNote({ id, updateBattlefieldPatchNoteInput: input });
      if (kind === 'system') await updateSystemPatchNote({ id, updateSystemPatchNoteInput: input });
      if (kind === 'gameMode') await updateGameModePatchNote({ id, updateGameModePatchNoteInput: input });
      await refetch();
      alertSuccess('Data patch berhasil diupdate!');
      hideModal(`edit-${kind}-patch-note`);
    } catch (error) { alertError('Gagal mengupdate data patch. Pastikan JSON valid.'); throw error; }
  };

  const handleDeleteSimpleSection = async (kind: 'battlefield' | 'system' | 'gameMode', id: string) => {
    if (!(await alertConfirm('Yakin ingin menghapus data patch ini?'))) return;
    if (kind === 'battlefield') await removeBattlefieldPatchNote({ id });
    if (kind === 'system') await removeSystemPatchNote({ id });
    if (kind === 'gameMode') await removeGameModePatchNote({ id });
    await refetch();
    alertSuccess('Data patch berhasil dihapus!');
  };

  return { handleAddPatchNote, handleEditPatchNote, handleDeletePatchNote, handleAddHeroPatchNote, handleEditHeroPatchNote, handleDeleteHeroPatchNote, handleAddSimpleSection, handleEditSimpleSection, handleDeleteSimpleSection };
};
