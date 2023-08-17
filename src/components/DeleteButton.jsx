import { TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function DeleteButton({
  warningMessage,
  handleDelete,
  id = 0,
}) {
  const elementId = `dialog${id}`;
  const dialog = document.getElementById(elementId);
  return (
    <>
      <button
        className="btn btn-error btn-outline btn-square self-end"
        onClick={() => dialog.showModal()}
      >
        <TrashIcon className="p-2" />
      </button>
      <dialog id={elementId} className="modal">
        <form method="dialog" className="modal-box">
          <ExclamationCircleIcon className="mb-4 h-8 w-8 text-error" />
          <h3 className="text-lg">{warningMessage}</h3>
          <div className="modal-action">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn">No</button>
            <button className="btn btn-error" onClick={handleDelete}>
              Yes
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
