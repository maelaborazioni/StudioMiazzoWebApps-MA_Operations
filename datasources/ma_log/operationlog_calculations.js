/**
 * @properties={type:4,typeid:36,uuid:"E4675881-A178-40F0-8677-93E27ABED860"}
 */
function op_ditta_converted()
{
	try
	{
		if(globals.isCliente())
			return globals.convert_DitteSede2Cliente(op_ditta);
		
		return op_ditta;
	}
	catch(ex)
	{
		return op_ditta;
	}
}

/**
 * @properties={type:12,typeid:36,uuid:"A94FCFF6-D92A-41FE-AA8B-D824F8965F8F"}
 */
function status_tooltip()
{
	var tooltip = '';
	switch(op_status)
	{
		case globals.OpStatus.ONGOING:
			tooltip = i18n.getI18NMessage('i18n:ma.msg.op.ongoing');
			break;
			
		case globals.OpStatus.SUCCESS:
			tooltip = i18n.getI18NMessage('i18n:ma.msg.op.success');
			break;
			
		case globals.OpStatus.ERROR:
			tooltip = i18n.getI18NMessage('i18n:ma.msg.op.error');
			break;
		
		case globals.OpStatus.WARNING:
			tooltip = i18n.getI18NMessage('i18n:ma.msg.op.warning');
			break;
	}
	
	return tooltip;
}

/**
 * @properties={type:93,typeid:36,uuid:"7A3EE12F-747B-407F-A03A-3FA3F3223170"}
 */
function date_periodo()
{
	return op_periodo && utils.parseDate(op_periodo.toString(10), globals.PERIODO_DATEFORMAT);
}

/**
 * @properties={type:12,typeid:36,uuid:"026DD014-35F2-432E-BF9C-4F3E54EC0F53"}
 */
function progress_perc()
{
	return (op_progress == 0 || op_progress == 100 ? op_progress.toFixed(0) : op_progress.toFixed(2)) + '%';
}

/**
 * @properties={type:12,typeid:36,uuid:"4305780C-5447-4905-9FEE-2469D42D09A3"}
 */
function status_icon()
{
	var imageUrl = '';
	switch(op_status)
	{
		case globals.OpStatus.ONGOING:
			imageUrl = 'media:///loader_16.gif';
			break;
			
		case globals.OpStatus.SUCCESS:
			imageUrl = 'media:///check_16.png';
			break;
			
		case globals.OpStatus.ERROR:
			imageUrl = 'media:///error_16.png';
			break;
		
		case globals.OpStatus.WARNING:
			imageUrl = 'media:///warning_16.png';
			break;
	}
	
	return imageUrl;
}
