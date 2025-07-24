import { alertConfirm, alertError, alertSuccess } from "../alert";
import { useCreateItem, useDeleteItem, useUpdateItem } from "../api/ItemApi";

export const useItemService = (refetch: () => Promise<any>) => {
  const { createItem } = useCreateItem();
  const { updateItem } = useUpdateItem();
  const { deleteItem } = useDeleteItem();

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

  const handleEditItem = async (editItem: any) => {
    try {
      const input = {
        name: editItem.name,
        type: editItem.type,
        tag: editItem.tag,
        attributes: editItem.attributes,
        price: Number(editItem.price),
        image: editItem.image,
        story: editItem.story,
        description: editItem.description,
        tips: editItem.tips,
        parent_items: editItem.parent_items,
      };
      await updateItem({ id: editItem._id, input });
      await refetch();
      alertSuccess('Item berhasil diupdate!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-item'))?.hide();
    } catch (error) {
      alertError('Gagal mengupdate item.');
      console.error(error);
      throw error;
    }
  }

  const handleDeleteItem = async (id: string) => {
    const confirm = await alertConfirm('Yakin ingin menghapus item ini? Data item akan dihapus permanen!');
    if (confirm == true) {
      try {
        await deleteItem({ id });
        await refetch();
        alertSuccess('Item berhasil dihapus!');
      } catch (error) {
        alertError('Gagal menghapus item.');
        console.error(error);
        throw error;
      }
    }
  };

  return {
    handleAddItem,
    handleEditItem,
    handleDeleteItem
  };
}