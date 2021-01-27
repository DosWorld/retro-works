const axios=require('axios');
const Terminal=require('./util').Terminal;
const LanguagePack=require('./util').LanguagePack;
const LANGUAGE_PACK_DATA={
	'zh-cn':{
		'Flight Control Center':'飞控中心',
		'Loading':'加载中……',
        KEYBOARD_HELP_IDLE:'Esc：退出',
		KEYBOARD_HELP:'Esc：退出    s:开启/关闭声音    p:暂停/继续',
		'No Flight Mission':'没有飞行任务。',
        'Aircraft Model:':'机种',
		'Longitude':'经度',
        'Latitude':'纬度',
        'Flight Time':'飞行时间',
        'Remaining Time':'剩余时间',
        'Total Distance':'总里程',
        'Remaining Distance':'剩余里程',
        'Elapsed Distance':'飞行里程',
        'In Flight':'飞行中',
        'Paused':'已暂停',
        'Crashed':'已坠毁',
        'Direction':'方向',
        'AGL':'相对高度',
        'Altitude':'海拔高度',
        'Vertical Speed':'垂直速度',
        'Speed':'速度',
        'Airspeed':'空速',
        'Groundspeed':'地速',
        'Mach':'马赫数',
        'Fuel':'燃料'
    },
	'ja':{
		'Flight Control Center':'飛行制御センター',
		'Loading':'Loading...',
		KEYBOARD_HELP_IDLE:'Esc：終了',
		KEYBOARD_HELP:'Esc：終了    s:ｻｳﾝﾄﾞｵﾝ/ｵﾌ    p:一時停止/再開',
		'No Flight Mission':'飛行任務がありません。',
		'Aircraft Model:':'機種：',
		'Longitude':'経度',
        'Latitude':'緯度',
        'Flight Time':'飛行時間',
        'Remaining Time':'残り時間',
        'Total Distance':'総距離',
        'Remaining Distance':'残り距離',
        'Elapsed Distance':'飛行距離',
        'In Flight':'飛行中',
        'Paused':'一時停止',
        'Crashed':'墜落しました',
        'Direction':'方向',
        'AGL':'対地高度',
        'Altitude':'海抜高度',
        'Vertical Speed':'垂直速度',
        'Speed':'速度',
        'Airspeed':'対気速度',
        'Groundspeed':'対地速度',
        'Mach':'マッハ数',
        'Fuel':'燃料'
    }
}
module.exports=class{
    data=undefined;
    running=true;
    constructor(stream,_exit,param={}){
        this._exit=_exit;
        
        this.terminal=new Terminal(stream,{
            outputEncoding:param.encoding
        });
        this.lang=new LanguagePack(LANGUAGE_PACK_DATA,param.language);
        
        this.FGFS_HOST=param.FGFS_HOST;
        this.terminal.pc98SetBottomLine(false);
        this.terminal.clrscr();
        this.terminal.locate(0,0);
        this.terminal.setcursor(false);
        this.terminal.print(this.lang.t('Loading'));
        this.refresh();
    }
    drawFrame(){
        this.terminal.clrscr();
        this.terminal.locate(0,1);
        this.terminal.setattr(1,7,36);
        this.terminal.print(' '.repeat(80));
        let title=this.lang.t('Flight Control Center');
        this.terminal.locate(Math.round((80-Terminal.strlen(title))/2),1);
        this.terminal.print(title);
        
        this.terminal.locate(0,25);
        this.terminal.setattr(7,36);
        this.terminal.print(' '.repeat(80));
        this.terminal.locate(2,25);
        this.terminal.print(this.lang.t(this.data ? 'KEYBOARD_HELP' : 'KEYBOARD_HELP_IDLE'));
        this.terminal.setattr(0);
    }
    async refresh(){
        setTimeout(()=>{
            if(this.running){
                this.refresh();
            }
        },1000);

        let data=null;
        try{
            data=await axios({
                method:'GET',
                url:this.FGFS_HOST+'/json/fgreport'
            });
        }catch(e){
            if(null!==this.data){
                this.data=null;
                this.drawFrame();
                let text=this.lang.t('Flight Control Center');
                this.terminal.locate(Math.floor((80-Terminal.strlen(text))/2),12);
                this.terminal.print(text);
            }
            return;
        }

        try{
            let fgreport={};
            for(let item of data.data.children){
                fgreport[item.name]=item.value;
            }

            if(!this.data){
                this.data=fgreport;
                this.drawFrame();
            }
            fgreport['longitude'] = Math.abs(fgreport['longitude-deg']).toFixed(6)+(fgreport['longitude-deg']>=0 ? 'E' : 'W');
            fgreport['latitude'] = Math.abs(fgreport['latitude-deg']).toFixed(6)+(fgreport['latitude-deg']>=0 ? 'N' : 'S');
            let pad=Terminal.rpad, padSize=11;
            this.terminal.locate(0,3);
            this.terminal.print(pad(this.lang.t('Aircraft Model'),padSize)+fgreport.aircraft+'        ');
            this.terminal.locate(0,4);
            this.terminal.print(pad(this.lang.t('Longitude'),padSize)+fgreport['longitude']+'        ');
            this.terminal.locate(0,5);
            this.terminal.print(pad(this.lang.t('Latitude'),padSize)+fgreport['latitude']+'        ');
            this.terminal.locate(0,6);
            this.terminal.print(pad(this.lang.t('Flight Time'),padSize)+fgreport['flight-time-string']+'        ');
            this.terminal.locate(0,7);
            this.terminal.print(pad(this.lang.t('Remaining Time'),padSize)+fgreport['ete-string']+'        ');
            this.terminal.locate(0,8);
            this.terminal.print(pad(this.lang.t('Total Distance'),padSize)+fgreport['total-distance'].toFixed(1)+'nm        ');
            this.terminal.locate(0,9);
            this.terminal.print(pad(this.lang.t('Remaining Distance'),padSize)+fgreport['distance-remaining-nm'].toFixed(1)+'nm        ');
            this.terminal.locate(0,10);
            this.terminal.print(pad(this.lang.t('Flight Distance'),padSize)+(Number(fgreport['total-distance'])-Number(fgreport['distance-remaining-nm'])).toFixed(1)+'nm        ');
            
            this.terminal.locate(40,4);
            this.terminal.print(pad(this.lang.t('Direction'),padSize)+(Number(fgreport['heading-deg'])).toFixed(2)+'°        ');
            this.terminal.locate(40,5);
            this.terminal.print(pad(this.lang.t('Altitude'),padSize)+(Number(fgreport['altitude-ft'])).toFixed(1)+'ft        ');
            this.terminal.locate(40,6);
            this.terminal.print(pad(this.lang.t('AGL'),padSize)+(Number(fgreport['altitude-agl-ft'])).toFixed(1)+'ft        ');
            this.terminal.locate(40,7);
            this.terminal.print(pad(this.lang.t('Vertical Speed'),padSize)+(Number(fgreport['vertical-speed-fps'])).toFixed(1)+'ft/s        ');
            if('ufo'==fgreport['flight-model']){
                this.terminal.locate(40,8);
                this.terminal.print(pad(this.lang.t('Speed'),padSize)+(Number(fgreport['vertical-speed-fps'])).toFixed(1)+'kts        ');
            }else{
                this.terminal.locate(40,8);
                this.terminal.print(pad(this.lang.t('Airspeed'),padSize)+(Number(fgreport['airspeed-kt'])).toFixed(1)+'kts        ');
                this.terminal.locate(40,9);
                this.terminal.print(pad(this.lang.t('Groundspeed'),padSize)+(Number(fgreport['groundspeed-kt'])).toFixed(1)+'kts        ');
                this.terminal.locate(40,10);
                this.terminal.print(pad(this.lang.t('Mach'),padSize)+(Number(fgreport['mach'])).toFixed(4)+'     ');
                this.terminal.locate(40,11);
                let fuelPercentage=Number(fgreport['remain-fuel'])/Number(fgreport['initial-fuel'])*100;
                this.terminal.print(pad(this.lang.t('Fuel'),padSize)+fuelPercentage.toFixed(2)+%     ');
            }

            this.terminal.locate(0,24);
            if(fgreport['crashed']){
                this.terminal.setattr(1,5,33,41);
                this.terminal.print(this.lang.t('Crashed'));
            }else if(fgreport['paused']){
                this.terminal.setattr(33);
                this.terminal.print(this.lang.t('Paused'));
            }else{
                this.terminal.setattr(32);
                this.terminal.print(this.lang.t('In Flight'));
            }
            this.terminal.setattr(0);
            this.terminal.print(' '.repeat(20));
        }catch(e){
            console.error(e);
        }
    }
    destroy(){
        try{
            this.running=false;
        }catch(e){
            console.error(e);
        }finally{
            this._exit();
        }
    }
    async toggleSound(){
        let {data}=await axios({
            method:'GET',
            url:this.FGFS_HOST+'/json/sim/sound/enabled'
        });
        await axios({
            method:'GET',
            url:this.FGFS_HOST+`/props/sim/sound?submit=set&enabled=${data.value ? 'false' : 'true'}`
        });
    }
    async togglePause(){
        await axios({
            method:'GET',
            url:this.FGFS_HOST+'/run.cgi?value=pause'
        });
    }
    ondata(data){
        try{
            switch(data[0]){
                case 0x1b:
                    this.terminal.reset();
                    this.destroy();
                    return;
                break;
                case 0x73:
                    this.toggleSound();
                break;
                case 0x70:
                    this.togglePause();
                break;
            }
        }catch(e){
            console.error(e);
        }
    }
}