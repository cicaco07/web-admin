import { alertError, alertSuccess } from "../alert";
import { useCreateEmblem } from "../api/EmblemApi";

export const useEmblemService = (refetch: () => Promise<any>) => {

  const { createEmblem } = useCreateEmblem();

  const handleAddEmblem = async (emblemForm: any) => {
    try {
      const input = {
        ...emblemForm,
      };
      await createEmblem({ input });
      await refetch();
      alertSuccess('Emblem berhasil ditambahkan!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-emblem'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan emblem.');
      console.error(error);
      throw error;
    }
  };

  return {
    handleAddEmblem,
  };
};