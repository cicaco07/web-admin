import { alertError, alertSuccess } from "../alert";
import { useCreateItem } from "../api/ItemApi";

export const useItemService = (refetch: () => Promise<any>) => {
  const { createItem } = useCreateItem();

  const handleAddItem = async (itemForm: any) => {
    console.log("handleAddItem", itemForm);
    try {
      const input = {
        ...itemForm,
        price: Number(itemForm.price),
      };
      await createItem({ input });
      await refetch();
      alertSuccess('Item berhasil ditambahkan!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-item'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan item.');
      console.error(error);
      throw error;
    }
  }

  return {
    handleAddItem,
  };
}