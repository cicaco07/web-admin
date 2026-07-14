import { alertConfirm, alertError, alertSuccess } from '../alert';
import {
  useCreateBattlefieldPatchNote,
  useCreateGameModePatchNote,
  useCreateHeroPatchNote,
  useCreatePatchChange,
  useCreatePatchNote,
  useImportPatchNoteFromUrl,
  usePublishPatchNote,
  useRemoveBattlefieldPatchNote,
  useRemoveGameModePatchNote,
  useRemoveHeroPatchNote,
  useRemovePatchChange,
  useRemovePatchNote,
  useRemoveSystemPatchNote,
  useReparsePatchNote,
  useUnpublishPatchNote,
  useUpdateBattlefieldPatchNote,
  useUpdateGameModePatchNote,
  useUpdateHeroPatchNote,
  useUpdatePatchChange,
  useUpdatePatchNote,
  useUpdateSystemPatchNote,
  useCreateSystemPatchNote,
} from '../api/PatchNoteApi';
import type {
  HeroPatchNoteFormData,
  PatchChangeFormData,
  PatchNoteFormData,
  SimplePatchNoteSectionFormData,
} from '../../types/PatchNote';

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

const compactObject = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== '' && entry !== undefined && entry !== null));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  return 'Terjadi kesalahan yang tidak diketahui.';
};

const patchNotePayload = (form: PatchNoteFormData) => compactObject({
  name: form.name,
  version: form.version,
  start_date: form.start_date,
  end_date: form.end_date,
  published_at: form.published_at,
  type: form.type,
  season: Number(form.season),
  is_active: form.is_active,
  status: form.status,
  source_url: form.source_url,
  source_newsid: form.source_newsid,
  summary: form.summary,
  raw_content: form.raw_content,
});

const patchChangePayload = (form: PatchChangeFormData) => compactObject({
  target_type: form.target_type,
  target_ref: form.target_ref,
  target_name: form.target_name,
  change_type: form.change_type,
  section: form.section,
  title: form.title,
  description: form.description,
  details: form.details,
  raw_text: form.raw_text,
  order: Number(form.order || 0),
});

export const usePatchNoteService = (refetch: () => Promise<unknown>) => {
  const token = localStorage.getItem('token') || '';
  const { createPatchNote } = useCreatePatchNote(token);
  const { updatePatchNote } = useUpdatePatchNote(token);
  const { removePatchNote } = useRemovePatchNote(token);
  const { importPatchNoteFromUrl } = useImportPatchNoteFromUrl(token);
  const { publishPatchNote } = usePublishPatchNote(token);
  const { unpublishPatchNote } = useUnpublishPatchNote(token);
  const { reparsePatchNote } = useReparsePatchNote(token);
  const { createPatchChange } = useCreatePatchChange(token);
  const { updatePatchChange } = useUpdatePatchChange(token);
  const { removePatchChange } = useRemovePatchChange(token);
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
      await createPatchNote({ createPatchNoteInput: patchNotePayload(form) });
      await refetch();
      alertSuccess('Patch note berhasil ditambahkan!');
      hideModal('add-patch-note');
    } catch (error) { alertError('Gagal menambahkan patch note.'); throw error; }
  };

  const handleEditPatchNote = async (form: PatchNoteFormData) => {
    try {
      if (!form._id) throw new Error('Missing patch note id');
      await updatePatchNote({ id: form._id, updatePatchNoteInput: patchNotePayload(form) });
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

  const handleImportPatchNote = async (url: string) => {
    try {
      await importPatchNoteFromUrl({ url });
      await refetch();
      alertSuccess('Patch note berhasil diimport sebagai draft!');
      hideModal('import-patch-note');
    } catch (error) { alertError('Gagal import patch note. Pastikan URL valid dan belum pernah diimport.'); throw error; }
  };

  const handlePublishPatchNote = async (id: string) => {
    if (!(await alertConfirm('Publish patch note ini? Data akan tampil di query publik.'))) return;
    await publishPatchNote({ id });
    await refetch();
    alertSuccess('Patch note berhasil dipublish!');
  };

  const handleUnpublishPatchNote = async (id: string) => {
    if (!(await alertConfirm('Unpublish patch note ini? Data akan kembali menjadi draft.'))) return;
    await unpublishPatchNote({ id });
    await refetch();
    alertSuccess('Patch note berhasil diunpublish!');
  };

  const handleReparsePatchNote = async (id: string) => {
    if (!(await alertConfirm('Reparse akan menghapus hasil parsed changes saat ini dan membuat ulang dari raw content. Lanjutkan?'))) return;
    try {
      const result = await reparsePatchNote({ id });
      if (!result?.data) throw new Error('Backend tidak mengembalikan hasil parse ulang.');
      await refetch();
      const totalChanges = result.data.reparsePatchNote?.length ?? 0;
      await alertSuccess(`Patch note berhasil diparse ulang. ${totalChanges} perubahan dibuat.`);
    } catch (error) {
      await alertError(`Gagal parse ulang patch note: ${getErrorMessage(error)}`);
      throw error;
    }
  };

  const handleAddPatchChange = async (form: PatchChangeFormData) => {
    try {
      if (!form.patchNoteId) throw new Error('Missing patch note id');
      await createPatchChange({ patchNoteId: form.patchNoteId, createPatchChangeInput: patchChangePayload(form) });
      await refetch();
      alertSuccess('Patch change berhasil ditambahkan!');
      hideModal('patch-change-form');
    } catch (error) { alertError('Gagal menyimpan patch change.'); throw error; }
  };

  const handleEditPatchChange = async (form: PatchChangeFormData) => {
    try {
      if (!form._id) throw new Error('Missing patch change id');
      await updatePatchChange({ id: form._id, updatePatchChangeInput: patchChangePayload(form) });
      await refetch();
      alertSuccess('Patch change berhasil diupdate!');
      hideModal('patch-change-form');
    } catch (error) { alertError('Gagal mengupdate patch change.'); throw error; }
  };

  const handleDeletePatchChange = async (id: string) => {
    if (!(await alertConfirm('Yakin ingin menghapus patch change ini?'))) return;
    await removePatchChange({ id });
    await refetch();
    alertSuccess('Patch change berhasil dihapus!');
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

  return {
    handleAddPatchNote,
    handleEditPatchNote,
    handleDeletePatchNote,
    handleImportPatchNote,
    handlePublishPatchNote,
    handleUnpublishPatchNote,
    handleReparsePatchNote,
    handleAddPatchChange,
    handleEditPatchChange,
    handleDeletePatchChange,
    handleAddHeroPatchNote,
    handleEditHeroPatchNote,
    handleDeleteHeroPatchNote,
    handleAddSimpleSection,
    handleEditSimpleSection,
    handleDeleteSimpleSection,
  };
};
