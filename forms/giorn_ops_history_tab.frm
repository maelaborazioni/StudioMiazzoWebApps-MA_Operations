dataSource:"db:/ma_log/operationuser",
extendsID:"E1B6951E-8C22-4464-9B19-707548D2B2DE",
items:[
{
displayType:2,
editable:false,
formIndex:11,
format:"0",
location:"618,50",
name:"fld_stato",
size:"90,20",
styleClass:"modif",
typeid:4,
uuid:"026E7B6F-4821-414C-BF43-8CF5A8761F18",
valuelistID:"044C2749-F8D4-4183-9FB7-E70483EE6677"
},
{
editable:false,
formIndex:6,
location:"90,50",
name:"fld_ragionesociale",
size:"320,20",
text:"Ragionesociale",
typeid:4,
uuid:"0A1ED5E6-5475-49D7-89DC-8CC9DBBE70C0"
},
{
formIndex:16,
labelFor:"fld_periodo",
location:"418,30",
mediaOptions:14,
size:"60,20",
text:"Periodo",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"110BE91C-066D-4044-8ADC-3E37898EDCC1"
},
{
formIndex:16,
labelFor:"fld_stato",
location:"618,30",
mediaOptions:14,
size:"60,20",
text:"Stato",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"1D412C82-4F6D-4B87-BCE1-2D344252A060"
},
{
formIndex:14,
labelFor:"fld_ragionesociale",
location:"90,30",
mediaOptions:14,
size:"100,20",
text:"Ragione sociale",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"2F83EC1E-C724-4B00-8307-BC0EE229E1E0"
},
{
formIndex:17,
location:"0,0",
name:"lbl_storico_operazioni",
size:"128,20",
styleClass:"title_text",
text:"Storico operazioni",
transparent:true,
typeid:7,
uuid:"3E517222-6B8C-4F60-8FF6-2CDACAA6A753"
},
{
background:"#dcdcdc",
height:435,
partType:5,
typeid:19,
uuid:"432A55D7-7ADE-44E0-A66C-D0A7EB6BA569"
},
{
displayType:2,
editable:false,
formIndex:11,
format:"0",
location:"518,50",
name:"fld_operazione",
size:"90,20",
styleClass:"modif",
typeid:4,
uuid:"4B8D32E3-7F5B-483B-8EA3-6052B5E78457",
valuelistID:"F2B94ADA-B9AF-48E1-AB62-4FAB60F849BD"
},
{
formIndex:15,
labelFor:"fld_cod_ditta",
location:"10,30",
mediaOptions:14,
size:"60,20",
text:"Codice ditta",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"707ADCA4-0C73-4DDA-9CE3-0CE6D5C279C6"
},
{
location:"718,51",
mediaOptions:2,
name:"btn_filter",
onActionMethodID:"-1",
onDoubleClickMethodID:"-1",
onRightClickMethodID:"-1",
rolloverCursor:12,
showClick:false,
size:"20,20",
toolTipText:"Attiva filtro",
transparent:true,
typeid:7,
uuid:"92B79803-D323-4E84-AB63-2D585C8CFB76",
verticalAlignment:0
},
{
customProperties:"methods:{\
onActionMethodID:{\
arguments:[\
null,\
null,\
\"'LEAF_Lkp_Ditte'\",\
\"'updateDitta'\",\
null,\
null,\
null,\
null,\
\"true\"\
]\
}\
}",
formIndex:7,
horizontalAlignment:0,
location:"70,50",
mediaOptions:2,
name:"btn_selditta",
onActionMethodID:"09683411-0331-4A08-BF5E-656611194522",
onDoubleClickMethodID:"-1",
onRightClickMethodID:"-1",
showClick:false,
size:"20,20",
styleClass:"btn_lookup",
transparent:true,
typeid:7,
uuid:"97562212-719D-4B35-BA9B-FACB4F5DAAF3",
verticalAlignment:0
},
{
formIndex:16,
labelFor:"fld_operazione",
location:"518,30",
mediaOptions:14,
size:"85,20",
text:"Operazione",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"A85D7734-03F2-4E9E-8D71-CE10B0955C65"
},
{
enabled:false,
location:"743,51",
mediaOptions:2,
name:"btn_unfilter",
onActionMethodID:"-1",
onDoubleClickMethodID:"-1",
onRightClickMethodID:"-1",
rolloverCursor:12,
showClick:false,
size:"20,20",
toolTipText:"Disattiva filtro",
transparent:true,
typeid:7,
uuid:"BAF40D21-F982-40C4-A1EF-9D996E861059",
verticalAlignment:0,
visible:false
},
{
anchors:14,
background:"#666666",
borderType:"SpecialMatteBorder,1.0,1.0,0.0,0.0,#434343,#434343,#000000,#000000,0.0,",
fontType:"Arial,1,11",
foreground:"#c0c0c0",
horizontalAlignment:0,
location:"0,415",
name:"lbl_vista_comunicazioni_filtro",
size:"800,20",
typeid:7,
uuid:"C44816DA-B905-4DB4-9A9A-CFC9654DF77F",
verticalAlignment:0
},
{
anchors:11,
borderType:"SpecialMatteBorder,0.0,0.0,0.0,0.0,#434343,#434343,#434343,#434343,0.0,",
location:"0,0",
mediaOptions:6,
size:"800,20",
styleClass:"title_bar",
transparent:true,
typeid:7,
uuid:"CAD654CE-ABEF-4246-9E4C-A67FDC25E8D2"
},
{
formIndex:11,
format:"MM/yyyy|mask",
horizontalAlignment:0,
location:"418,50",
name:"fld_periodo",
size:"90,20",
typeid:4,
uuid:"D639F2F9-C2C0-4BEB-9562-9A04B2004883"
},
{
anchors:15,
formIndex:1,
items:[
{
containsFormID:"D0A89555-A914-46BA-8EA1-C2DA0830FEF8",
location:"310,199",
text:"giorn_ops_history",
typeid:15,
uuid:"E3C030CA-DE59-4D5F-9A6B-F6047ABF5D34"
}
],
location:"0,81",
name:"tab_history_tbl",
printable:false,
size:"800,334",
tabOrientation:-1,
transparent:true,
typeid:16,
uuid:"EA1F3463-28DA-468F-A3F3-04AA4BC6BBDE"
},
{
formIndex:5,
format:"#####",
horizontalAlignment:0,
location:"10,50",
name:"fld_cod_ditta",
onActionMethodID:"-1",
onDataChangeMethodID:"-1",
selectOnEnter:true,
size:"60,20",
text:"Cod Ditta",
typeid:4,
uuid:"F0D63A06-41ED-45F6-884D-D532620C2899"
},
{
anchors:11,
formIndex:1,
location:"0,0",
name:"lbl_op_header",
size:"800,20",
styleClass:"title_bar",
typeid:7,
uuid:"F1CF332B-EBB1-4FE7-9F61-910301EA92D5"
}
],
name:"giorn_ops_history_tab",
onLoadMethodID:"A8D8EAF0-1AB8-4248-8AB0-3D153A09C5FA",
onRecordSelectionMethodID:"16BD9642-A11B-44C2-8838-4E694E689436",
onShowMethodID:"-1",
scrollbars:36,
size:"800,435",
styleName:"leaf_style",
typeid:3,
uuid:"25479E7B-7AEA-443A-9A95-DF558D65D380"