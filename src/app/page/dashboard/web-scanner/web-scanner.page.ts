import {Component, ViewChild} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {ZXingScannerComponent} from '@zxing/ngx-scanner';
import {BarcodeFormat} from '@zxing/library';
import {PageController} from "../../page-controller";
import {ToastType} from "../../../libs/Utils";
import {Events} from '../../../services/Events';

@Component({
    selector: 'app-web-scanner',
    templateUrl: './web-scanner.page.html',
    styleUrls: ['./web-scanner.page.scss'],
})
export class WebScannerPage extends PageController {

    @ViewChild('scanner') scanner: ZXingScannerComponent;
    
    allowedFormats = [];

    flashAllowed:boolean = true;
    multiDeviceAllowed:boolean = true;

    flashEnabled:boolean = false;
    mediaDevices:MediaDeviceInfo[] = [];
    selectedDeviceindex:number = 0;
    

    constructor(private modalCtrl: ModalController, 
                public event: Events) {
        super();
        this.allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX /*, ...*/ ];
    }

    public async ngOnInit() {
        await super.ngOnInit();
        this.scanner.autostarted.subscribe(()=>{
            this.checkMediaDevice((device)=>{
                if(device){
                    this.scanner.device = device;
                    this.scanner.enable = true;
                    this.scanner.torch = false;
                    this.scanner.autofocusEnabled = true;
                    this.scanner.previewFitMode = 'contain';
                    this.scanner.timeBetweenScans = 1000;
                    this.scanner.formats = this.allowedFormats;
                }
                else {
                    this.showToastMsg(this.strings.getString('no_camera_msg'), ToastType.ERROR, 3000);
                    this.dismiss();
                }
            });
        });
        this.scanner.torchCompatible.subscribe((enabled: boolean)=>{
            this.flashAllowed = enabled;
        });
        this.scanner.scanSuccess.subscribe((code: any) => {
            this.event.webScannerResult.emit(code);
        })
        this.checkPermission();
    }
    
    
    /* Check media camera devices
     * */
    private checkMediaDevice(callback?:(device?:MediaDeviceInfo)=>any){
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            let checking=["videoinput"];
            navigator.mediaDevices.enumerateDevices()
            .then((devices)=> {
                this.mediaDevices = devices.filter(device => checking.includes(device.kind));
                this.multiDeviceAllowed = this.mediaDevices && this.mediaDevices.length >= 2; // TODO make > 1
                if(callback){
                    callback(this.multiDeviceAllowed?this.mediaDevices[1]:this.mediaDevices[0]);
                }
            })
            .catch(() => {
                this.mediaDevices = [];
                if(callback){
                    callback();
                }
            });
        }
        else {
            this.mediaDevices = [];
            if(callback){
                callback();
            }
        }
    }
    /* Check camera Permission
     * */
    public checkPermission(callback?:(granted:boolean)=>any) {
        this.scanner.askForPermission().then((granted) => {
            if(!granted){
                this.showAlert(
                    this.strings.getString("permission_required_txt"),
                    this.strings.getString("no_camera_permission_msg"),
                    {
                        title: this.strings.getString("ok_txt"),
                        callback: () => {
                            this.dismiss();
                        }
                    }
                );
            }
            else {
                if(callback) callback(granted);
            }
        })
    }

    public async ionViewDidEnter(){}

    /**
     * Toggle Flash on & off
     * @param toggle 
     */
    public async toggleFlash(){
        if(this.scanner){
            this.flashEnabled = !this.flashEnabled;
            this.scanner.torch = this.flashEnabled;
        }
    }

    /**
     * Change Media Device
     */
    public async changeMediaDevice(){
        if(this.multiDeviceAllowed){
            if(this.selectedDeviceindex+1 >= this.mediaDevices.length){
                if(this.scanner && !this.scanner.isCurrentDevice(this.mediaDevices[0])){
                    this.scanner.device = this.mediaDevices[0]
                    this.selectedDeviceindex = 0;
                }
            }
            else {
                if(this.scanner && !this.scanner.isCurrentDevice(this.mediaDevices[this.selectedDeviceindex+1])){
                    this.scanner.device = this.mediaDevices[this.selectedDeviceindex+1]
                    this.selectedDeviceindex = this.selectedDeviceindex+1;
                }
            }
        }
    }

    /**Close Modal*/
    async dismiss(){
        if(this.scanner){
            this.scanner.enable = false;
            this.scanner.ngOnDestroy();
        }
        const modal = await this.modalCtrl.getTop();
        if(modal) modal.dismiss();
    }
}
