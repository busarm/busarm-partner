import {Component, Input} from '@angular/core';
import {ActionSheetController, ModalController, Platform} from "@ionic/angular";
import {Camera,CameraOptions,PictureSourceType} from "@ionic-native/camera/ngx";
import {File,FileEntry} from "@ionic-native/file/ngx";
import {PageController} from "../../page-controller";
import { BusImage } from "../../../models/Bus/BusImage";
import { BusSharedPartner } from "../../../models/Bus/BusSharedPartner";
import { Bus } from "../../../models/Bus/Bus";
import { User } from "../../../models/User/User";
import {ToastType, Utils} from "../../../helpers/Utils";
import {Api} from "../../../helpers/Api";
import {Strings} from "../../../resources";
import {DestinationType} from "@ionic-native/camera";
import { ShareBusPage } from '../share-bus/share-bus.page';
import { Events } from '../../../services/app/Events';

@Component({
    selector: 'app-view-bus',
    templateUrl: './view-bus.page.html',
    styleUrls: ['./view-bus.page.scss'],
})
export class ViewBusPage extends PageController {

    @Input() bus: Bus = null;

    platform: Platform;

    toggleUpdate: boolean = false;
    busDescription: string;

    constructor(private camera: Camera,
                private file: File,
                private actionSheetController: ActionSheetController,
                private modalCtrl: ModalController,
                public events: Events,
                platform: Platform) {
        super();
        this.platform = platform;
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }

    public ngOnDestroy(){
        this.bus = null;
        super.ngOnDestroy();
    }

    public async ionViewDidEnter(){
        if (!this.assertAvailable(this.bus)) {
            this.showToastMsg(this.strings.getString("error_unexpected"), ToastType.ERROR);
            this.modalCtrl.dismiss();
        }
    }

    /**Load Bus View*/
    public loadBusView(completed?: () => any) {

        /*Get bus*/
        Api.getBus(this.bus.id, (status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.bus = result.data;
                }
                else {
                    this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                }
            }
            else {
                this.showToastMsg(result, ToastType.ERROR);
            }

            if (this.assertAvailable(completed)) {
                completed();
            }
        });
    }


    /**Show Delete confirmation
     * */
    public confirmDelete() {
        this.showAlert(
            this.strings.getString("delete_bus_title_txt"),
            this.strings.getString("delete_bus_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.deleteBus(this.bus.id);
                }
            },
        );
    }

    public showUpdateBus(){
        this.busDescription = this.bus.description;
        this.toggleUpdate = true;
    }
    public hideUpdateBus(){
        this.toggleUpdate = false;
        this.busDescription = null;
    }

    /**Update Bus*/
    public updateBus() {
        if(this.busDescription && this.busDescription != this.bus.description){
            this.showLoading().then(() => {
                Api.updateBus(this.bus.id, this.busDescription, (status, result) => {
                    this.hideLoading();
                    if (status) {
                        if (this.assertAvailable(result)) {
                            if (result.status) {
                                this.hideUpdateBus();
                                this.loadBusView();
                                this.events.busesUpdated.emit(true);
                                this.showToastMsg(result.msg, ToastType.SUCCESS);
                            }
                            else {
                                this.showToastMsg(result.msg, ToastType.ERROR);
                            }
                        }
                        else {
                            this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(result, ToastType.ERROR);
                    }
                });
            });
        }
        else {
            this.hideUpdateBus();
        }
    }

    /**Delete Bus*/
    public deleteBus(busId: string) {
        this.showLoading().then(() => {
            Api.deleteBus(busId, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status) {
                            this.events.busesUpdated.emit(true);
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                            this.dismiss();
                        }
                        else {
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }


    /**Select Image to upload*/
    async selectImage() {
        const actionSheet = await this.actionSheetController.create({
            header: this.strings.getString('select_image_source_txt'),
            buttons: [
                {
                    text: this.strings.getString('load_library_txt'),
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                    }
                },
                {
                    text: this.strings.getString('use_camera_txt'),
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.CAMERA);
                    }
                },
                {
                    text: this.strings.getString('cancel_txt'),
                    role: 'cancel'
                }
            ]
        });
        await actionSheet.present();
    }

    /**Initiate Photo Source*/
    takePicture(sourceType: PictureSourceType) {
        let options: CameraOptions = {
            destinationType:DestinationType.FILE_URL,
            quality: 80,
            allowEdit:true,
            sourceType: sourceType,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };

        this.camera.getPicture(options).then(imagePath => {
            this.startUpload(imagePath);
        });

    }

    /**On Input change listener*/
    changeListener(event){
        if (event && event.isTrusted) {
            this.readFile(event.target.files[0])
        }
    }

    /**Initiate File Upload*/
    startUpload(filePath:string) {
        this.file.resolveLocalFilesystemUrl(filePath)
            .then(entry => {
                ( < FileEntry > entry).file(file => this.readFile(file))
            })
            .catch(err => {
                // this.showToastMsg('Error while reading file.',ToastType.ERROR);
                this.showToastMsg(err,ToastType.ERROR);
            });
    }

    /**Get file from storage*/
    readFile(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const formData = new FormData();
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            formData.append('busImage', imgBlob, file.name);
            formData.append('busId', this.bus.id);
            this.uploadImageData(formData);
        };
        reader.readAsArrayBuffer(file);
    }

    /**Upload File to server*/
    uploadImageData(formData: FormData) {
        this.showLoading().then(() => {
            Api.addBusImage(formData, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status) {
                            this.loadBusView();
                            this.events.busesUpdated.emit(true);
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        }
                        else {
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**
     * Show Share bus page
     */
    public async shareBus(){
        let chooseModal = await this.modalCtrl.create({
            component: ShareBusPage,
            componentProps: {
                busId: this.bus.id
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadBusView();
            }
        });
        return await chooseModal.present();
    }

    /**Show Delete confirmation
     * */
    public confirmDeleteImage(image:BusImage) {
        this.showAlert(
            this.strings.getString("delete_image_title_txt"),
            this.strings.getString("delete_image_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.deleteBusImage(image.id);
                }
            },
        );
    }


    /**Delete Image*/
    public deleteBusImage(imagedId: string) {
        this.showLoading().then(()=>{
            Api.deleteBusImage(this.bus.id, imagedId,(status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status){
                            this.loadBusView();
                            this.events.busesUpdated.emit(true);
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        }
                        else{
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }


    /**Show Delete confirmation
     * */
    public confirmDeleteSharedBus(shared: BusSharedPartner) {
        this.showAlert(
            this.strings.getString("delete_bus_share_title_txt"),
            this.strings.getString("delete_bus_share_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.deleteSharedBus(shared);
                }
            },
        );
    }

    /**Delete Shared Bus*/
    public deleteSharedBus(shared: BusSharedPartner) {
        this.showLoading().then(()=>{
            Api.deleteSharedBus(shared.bus_id, shared.partner_id,(status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status){
                            this.loadBusView();
                            this.events.busesUpdated.emit(true);
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        }
                        else{
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**Get Status class for bus status*/
    public getBusStatusClass(available: boolean): string {
        if (available) {
            return "status-ok";
        }
        else {
            return "status-error";
        }
    }

    /**Get Status text for bus status*/
    public getBusStatus(available: boolean): string {
        if (available) {
            return this.strings.getString('available_txt');
        }
        else {
            return this.strings.getString('in_use_txt');
        }
    }

    async dismiss() {
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss();
    }
}
