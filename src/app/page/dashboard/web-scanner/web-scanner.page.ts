import {Component, Input, ViewChild} from '@angular/core';
import {PageController} from "../../page-controller";
import {ModalController} from "@ionic/angular";
import {BusInfo, BusType} from "../../../models/ApiResponse";
import {ToastType, Utils} from "../../../libs/Utils";
import {Api} from "../../../libs/Api";
import { ZXingScannerComponent } from 'angular-weblineindia-qrcode-scanner';
import { BarcodeFormat } from 'angular-weblineindia-qrcode-scanner/library';

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
    

    constructor(private modalCtrl: ModalController) {
        super();
        this.allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX /*, ...*/ ];
    }

    public async ngOnInit() {
        await super.ngOnInit();
        this.scanner.enable = true;
        this.scanner.autofocusEnabled = true;
        this.scanner.previewFitMode = 'contain';
        this.scanner.torchCompatible.subscribe((enabled: boolean)=>{
            this.flashAllowed = enabled;
        });
        this.scanner.scanSuccess.subscribe((code: any) => {
            this.dismiss(code);
        })
        this.checkPermission();
        this.checkMediaDevice();
    }
    
    
    /* Check media camera devices
     * */
    private checkMediaDevice(){
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            let checking=["videoinput"];
            navigator.mediaDevices.enumerateDevices()
            .then((devices)=> {
                this.mediaDevices = devices.filter(device => checking.includes(device.kind));
                this.multiDeviceAllowed = this.mediaDevices && this.mediaDevices.length >= 1; // TODO make > 1
            })
            .catch(() => {
                this.mediaDevices = [];
            });
        }
        else {
            this.mediaDevices = [];
        }
    }
    /* Check camera Permission
     * */
    public checkPermission(callback?:(granted:boolean)=>any) {
        this.scanner.askForPermission().then((granted) => {
            console.log('Camera Permission '+granted);
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
        this.scanner.torch = !this.scanner.torch;
        this.flashEnabled = this.scanner.torch;
    }

    /**
     * Change Media Device
     */
    public async changeMediaDevice(){
        if(this.multiDeviceAllowed){
            if(this.selectedDeviceindex+1 > this.mediaDevices.length-1){
                this.scanner.device = this.mediaDevices[0]
                this.selectedDeviceindex = 0;
            }
            else {
                this.scanner.device = this.mediaDevices[this.selectedDeviceindex+1]
                this.selectedDeviceindex = this.selectedDeviceindex+1;
            }
        }
    }

    /**Close Modal*/
    async dismiss(code?:string){
        this.scanner.enable = false;
        this.scanner.ngOnDestroy();
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(Utils.assertAvailable(code)?code:false);
    }
}
