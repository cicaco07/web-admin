import { alertConfirm, alertError, alertSuccess } from "../alert";
import { useCreateTournament, useDeleteTournament, useUpdateTournament } from "../api/TournamentService";

export const useTournamentService = (refetch: () => Promise<any>) => {
  const { createTournament } = useCreateTournament();
  const { deleteTournament } = useDeleteTournament();
  const { updateTournament } = useUpdateTournament();

  const handleCreateTournament = async (form: any) => {
    try {
      const input = {
        name: form.name,
        slug: form.slug,
        tier: form.tier.toLowerCase(),
        tierLevel: Number(form.tierLevel),
        region: form.region,
        liquipediaUrl: form.liquipediaUrl,
        liquipediaSlug: form.liquipediaSlug,
        status: form.status.toLowerCase(),
        prizePool: form.prizePool,
      };
      await createTournament({ input });
      await refetch();
      alertSuccess('Tournament berhasil ditambahkan!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-tournament'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan tournament.');
      console.error(error);
      throw error;
    }
  };

  const handleUpdateTournament = async (id: string, form: any) => {
    try {
      const input = {
        name: form.name,
        slug: form.slug,
        tier: form.tier.toLowerCase(),
        tierLevel: Number(form.tierLevel),
        region: form.region,
        liquipediaUrl: form.liquipediaUrl,
        liquipediaSlug: form.liquipediaSlug,
        status: form.status.toLowerCase(),
        prizePool: form.prizePool,
      };
      await updateTournament({ id, input });
      await refetch();
      alertSuccess('Tournament berhasil diperbarui!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-tournament'))?.hide();
    } catch (error) {
      alertError('Gagal memperbarui tournament.');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteTournament = async (id: string) => {
    const confirm = await alertConfirm('Yakin ingin menghapus tournament ini? Data akan dihapus permanen!');
    if (confirm === true) {
      try {
        await deleteTournament({ id });
        await refetch();
        alertSuccess('Tournament berhasil dihapus!');
      } catch (error) {
        alertError('Gagal menghapus tournament.');
        console.error(error);
        throw error;
      }
    }
  };

  return {
    handleCreateTournament,
    handleUpdateTournament,
    handleDeleteTournament,
  };
};

