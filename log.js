/**
 * @properties={typeid:24,uuid:"B73E0269-6110-4C7B-82D3-0F64F9852E8A"}
 */
function showStoricoOperazioni()
{
	var frm = forms.mao_history_main;
	globals.ma_utl_showFormInDialog(frm.controller.getName(), 'Storico operazioni');
}

/**
 * @param {Number} [periodo]
 * 
 * @properties={typeid:24,uuid:"B06421A2-52B0-48AB-8141-A68DC8347030"}
 */
function apriStoricoOperazioni(periodo)
{
	var frm = forms.mao_history_main;
    //  apertura form storico senza necessariamente aprire il program relativo (molto più snello)	
	globals.ma_utl_showFormInDialog(frm.controller.getName(), 'Storico operazioni');
	
	// codice precedente
	// globals.openProgram('MA_StoricoOperazioni', null, true);
}

/**
 * @param {Number} [periodo]
 *
 * @properties={typeid:24,uuid:"2836E312-E001-4A6F-9876-888FD0C41683"}
 */
function apriStoricoOperazioniLite(periodo)
{
	var frm = forms.mao_history_main_lite;
    //  apertura form storico senza necessariamente aprire il program relativo (molto più snello)	
	globals.ma_utl_showFormInDialog(frm.controller.getName(), 'Avanzamento stato operazione');
	
	// codice precedente
	// globals.openProgram('MA_StoricoOperazioni', null, true);
}

