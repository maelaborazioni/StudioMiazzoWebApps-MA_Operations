
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"8D6C4D4A-096D-4527-9BE8-6F6AF4253097"}
 */
function onActionBtnPrint(event) 
{
	globals.printFile(operationfile_to_filelog.getSelectedRecord());
}
