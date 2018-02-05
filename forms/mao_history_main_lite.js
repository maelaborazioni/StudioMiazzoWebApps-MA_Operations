
/**
 *
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"284C62F8-D6F5-44ED-948E-BFE70028655E"}
 */
function onHide(event) 
{
	gotoBrowse();
	
	globals.svy_mod_closeForm(event);
	
	// eventuale ridisegno della giornaliera correntemente visualizzata 
	var selTabName = forms.svy_nav_fr_openTabs.vTabObjects[forms.svy_nav_fr_openTabs.vTabNames[forms.svy_nav_fr_openTabs.vSelectedTab]];
    if(selTabName && utils.stringLeft(selTabName.program,16) == 'LEAF_Giornaliera')
       globals['aggiornaGiornaliera']();
 }

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F87C0849-BD01-4E9C-A304-5798DBBAA679"}
 */
function onActionPrint(event) 
{
	forms.mao_history_lite.scaricaDocumenti(event);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"BE723AE3-4A2A-4342-87B5-C665593EA1F0"}
 */
function onActionConfirm(event) 
{
	globals.svy_mod_closeForm(event);
}

/**
 *
 * @param {Boolean} firstShow
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"7F814972-8AF8-4B5C-BD49-AD50BAADFDA3"}
 */
function onShowForm(firstShow, event) 
{
	_super.onShowForm(firstShow, event);
	elements.lbl_history_msg.visible = false;
}
