import{d as e,r as l,c as a,b as o,w as t,e as u,f as r,i as s,t as n,o as i,E as c,j as d,k as v,g as f,h as p,F as m,n as y,m as h,u as w,z as g}from"./index-5ITafVn6.js";import{_ as k,l as x,U as I,c as _,b as T,i as V,e as b,f as C}from"./index-CKkgec9T.js";const z={class:"dialog-container"},$={class:"buttons layout-h layout-center"},S=k(e({__name:"index",props:{modelValue:{type:Boolean,default:!1},fileInfo:{default:{}}},emits:["update:modelValue","commit","cancel"],setup(e,{emit:d}){const v=d,f=l({code:""}),p=l({visible:!0}),m=()=>{v("cancel"),v("update:modelValue")},y=()=>{if(!f.code)return c.error("不能为空"),!1;v("commit",f.code)};return(l,c)=>{const d=o("el-input"),v=o("el-form-item"),h=o("el-form"),w=o("el-button"),g=o("el-dialog");return i(),a(g,{"before-close":m,width:600,"append-to-body":"","custom-class":"cost-config-dialog",title:2===e.fileInfo.fileType?"校验开放码":"成为文件共享者",modelValue:p.visible,"onUpdate:modelValue":c[2]||(c[2]=e=>p.visible=e)},{default:t((()=>[u("div",z,[2===e.fileInfo.fileType?(i(),a(h,{key:0,form:f},{default:t((()=>[r(v,{label:"开放码",prop:"code"},{default:t((()=>[r(d,{class:"simulate-password",placeholder:"请输入6位数字的开放码",clearable:"",modelValue:f.code,"onUpdate:modelValue":c[0]||(c[0]=e=>f.code=e),modelModifiers:{trim:!0}},null,8,["modelValue"])])),_:1}),r(v,{label:"温馨提示",prop:"code"},{default:t((()=>{var l;return[s(" 文件需要校验开发码通过后, 才可以编辑，如未获得开放码， 请联系[ "+n(null==(l=e.fileInfo)?void 0:l.name)+" ]的文件所有者 ",1)]})),_:1})])),_:1},8,["form"])):(i(),a(h,{key:1,form:f},{default:t((()=>[r(v,{label:"共享码",prop:"code"},{default:t((()=>[r(d,{class:"simulate-password",placeholder:"请输入6位数字的共享码",clearable:"",modelValue:f.code,"onUpdate:modelValue":c[1]||(c[1]=e=>f.code=e),modelModifiers:{trim:!0}},null,8,["modelValue"])])),_:1}),r(v,{label:"温馨提示",prop:"code"},{default:t((()=>{var l;return[s(" 文件需要校验共享码通过后, 即可成为文件共享者，如未获得共享码， 请联系[ "+n(null==(l=e.fileInfo)?void 0:l.name)+" ]的文件所有者 ",1)]})),_:1})])),_:1},8,["form"])),u("div",$,[r(w,{onClick:m,class:"custom-gray"},{default:t((()=>c[3]||(c[3]=[s("取消")]))),_:1}),r(w,{type:"primary",onClick:y,class:"custom"},{default:t((()=>c[4]||(c[4]=[s("提交")]))),_:1})])])])),_:1},8,["title","modelValue"])}}}),[["__scopeId","data-v-ca81972e"]]),U={class:"home-head-warp layout-h layout-space-between"},B={class:"layout-h layout-h-center"},j={style:{"font-size":"14px",color:"var(--el-color-primary)","text-decoration":"underline"},class:"gutter-h"},E={key:0,class:"layout-h layout-h-center",style:{"font-size":"14px",color:"var(--el-color-warning)"}},J={class:"layout-h layout-h-center"},M={key:0,class:"gutter-h cursor",style:{"font-size":"12px",color:"var(--el-color-info)"}},N={style:{"font-size":"14px",color:"var(--el-color-primary)","text-decoration":"underline"}},O={key:3,class:"layout-h layout-h-center"},W=k(e({__name:"index",setup(e){const l=h(),k=d(null),z=d(""),$=d(!1),W=d("login"),q=d({}),D=d(!1),F=d(!1),L=d(""),R=d({}),A=v((()=>R.value.code+z.value)),G=(e="login")=>{W.value=e,$.value=!0},H=()=>{y.confirm("确定退出登录？","提示",{cancelButtonText:"取消",confirmButtonText:"退出"}).then((()=>{c.success("退出登录"),q.value={},sessionStorage.removeItem("userInfo"),window.location.reload()}))},K=()=>{const e=`${window.location.origin}/?code=${R.value.code}&fileType=${R.value.fileType}`;_(e)},P=()=>{window.location.href="/"},Q=(e=null)=>{L.value=e??R.value.code,D.value=!1,z.value=Date.now()},X=(e="")=>{if(2===R.value.fileType){if(!/^\d{6}$/.test(e))return c.error("请输入6位数字开放码， 不含空格"),!1;b({openCode:e,code:R.value.code}).then((l=>{if(0===l.data)return c.success("开放码校验成功"),L.value=R.value.code,window.localStorage.setItem(`${R.value.code}`,e),Q(),F.value=!1,!1;const a=1===l.data?"当前开放码已失效":"开放码错误";c.error(a)}))}if(0===R.value.fileType){if(!/^\d{6}$/.test(e))return c.error("请输入6位数字共享码， 不含空格"),!1;C({code:R.value.code,userId:q.value.id,shareCode:e}).then((e=>{e.data===R.value.code&&(F.value=!1,Q(),c.success("恭喜你成为本文件共享者"))}))}},Y=async()=>{var e;if(0!==(null==(e=R.value)?void 0:e.fileType))return!1;if(D.value=!0,L.value=R.value.code,q.value.id){const e=await V({code:R.value.code,userId:q.value.id});if(0===e.data)return F.value=!0,!1;if(1===e.data)return Q(),!1;2===e.data&&(c.error("您是文件的拥有者， 即将返回系统首页"),setTimeout((()=>{window.location.href=`/index?fileCode=${R.value.code}`}),2e3))}},Z=()=>{var e;null==(e=k.value)||e.downloadExcel()},ee=(e={})=>{var l;q.value=e,sessionStorage.setItem("userInfo",JSON.stringify(e)),0===(null==(l=R.value)?void 0:l.fileType)&&Y()};return(async()=>{const{code:e}=l.query,a=sessionStorage.getItem("userInfo");if(a&&(q.value=JSON.parse(a)),!e)return window.location.href="/",!1;try{const l=await T({code:e});R.value=l.data,Y(),(()=>{var e,l;if(1===(null==(e=R.value)?void 0:e.fileType)){const e=`${null==(l=R.value)?void 0:l.name}为私有文件，不对外公开，请返回首页`;y.alert(e,"提示",{confirmButtonText:"去首页",callback:()=>{window.location.href="/"}})}})(),(async()=>{var e,l;if(2===(null==(e=R.value)?void 0:e.fileType)){const e=window.localStorage.getItem(`${R.value.code}`);if(e){const a=await b({openCode:e,code:R.value.code,userId:(null==(l=q.value)?void 0:l.id)??null});if(0===a.data)return Q(),!1;if(3===a.data)return c.error("您是文件的拥有者， 即将返回系统首页"),setTimeout((()=>{window.location.href=`/index?fileCode=${R.value.code}`}),2e3),!1;D.value=!0,F.value=!0,L.value=R.value.code}else F.value=!0,D.value=!0,L.value=R.value.code}})()}catch(o){}})(),(e,l)=>{const c=o("el-icon");return i(),f(m,null,[u("div",U,[u("div",B,[r(c,{color:"#666",size:16,class:"gutter-h cursor",title:"首页",onClick:P},{default:t((()=>[r(w(g))])),_:1}),u("span",null,"当前文件["+n(["共享","私有","开放"][R.value.fileType])+"文件]：",1),u("div",j,n(R.value.name),1)]),q.value.id||0!==R.value.fileType?p("",!0):(i(),f("div",E,l[4]||(l[4]=[u("span",null,"注意: 本文件为共享文件， 需要用户登录后，填写共享码成为文件共享者，才有相关权限！",-1)]))),u("div",J,[2===R.value.fileType&&D.value?(i(),f("span",M,"开放码校验")):p("",!0),q.value.id||0!==R.value.fileType?(i(),f(m,{key:1},[u("span",{class:"gutter-h cursor",style:{"font-size":"12px",color:"var(--el-color-info)"},onClick:Z},"导出表格"),u("span",{class:"gutter-h cursor",style:{"font-size":"12px",color:"var(--el-color-info)"},onClick:K},"分享链接")],64)):p("",!0),q.value.id?(i(),f(m,{key:2},[u("span",N,n(q.value.name),1),l[5]||(l[5]=s("   [")),u("span",{style:{"font-size":"12px",color:"var(--el-color-error)"},class:"cursor",onClick:H},"退出"),l[6]||(l[6]=s("] "))],64)):(i(),f("div",O,[u("span",{style:{"font-size":"14px"},class:"cursor",onClick:l[0]||(l[0]=e=>G("login"))},"请登录"),l[7]||(l[7]=s("   [")),u("span",{style:{"font-size":"12px",color:"var(--el-color-info)"},class:"cursor",onClick:l[1]||(l[1]=e=>G("register"))},"未注册？"),l[8]||(l[8]=s("] "))]))])]),(i(),a(x,{ref_key:"luckySheetRef",ref:k,key:A.value,fileCode:L.value,userInfo:q.value,showWatermark:D.value},null,8,["fileCode","userInfo","showWatermark"])),$.value?(i(),a(I,{key:0,modelValue:$.value,"onUpdate:modelValue":l[2]||(l[2]=e=>$.value=e),type:W.value,onLoginSuccess:ee},null,8,["modelValue","type"])):p("",!0),F.value?(i(),a(S,{key:1,modelValue:F.value,"onUpdate:modelValue":l[3]||(l[3]=e=>F.value=e),fileInfo:R.value,type:W.value,onCommit:X},null,8,["modelValue","fileInfo","type"])):p("",!0)],64)}}}),[["__scopeId","data-v-9693e997"]]);export{W as default};
