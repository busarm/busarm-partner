import {Component, Input} from '@angular/core';
import {ActionSheetController, ModalController, Platform} from "@ionic/angular";
import {Camera,CameraOptions,PictureSourceType} from "@ionic-native/camera/ngx";
import {File,FileEntry} from "@ionic-native/file/ngx";
import {PageController} from "../../page-controller";
import {BusImage, BusInfo, UserInfo} from "../../../models/ApiResponse";
import {ToastType, Utils} from "../../../utils/Utils";
import {Api} from "../../../utils/Api";
import {Strings} from "../../../resources";
import {DestinationType} from "@ionic-native/camera";

@Component({
    selector: 'app-view-bus',
    templateUrl: './view-bus.page.html',
    styleUrls: ['./view-bus.page.scss'],
})
export class ViewBusPage extends PageController {

    @Input() bus: BusInfo = null;

    updated: boolean = false;
    platform: Platform;

    constructor(private camera: Camera,
                private file: File,
                private actionSheetController: ActionSheetController,
                private modalCtrl: ModalController,
                platform: Platform) {
        super();
        this.platform = platform;
    }

    public async ngOnInit() {
        await super.ngOnInit();
        if (this.assertAvailable(this.bus)) {
            this.loadBusView();
        }
        else {
            this.showToastMsg(this.strings.getString("error_unexpected"), ToastType.ERROR);
            this.modalCtrl.dismiss();
        }
    }
    public async ionViewDidEnter(){}

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

    /**Delete Bus*/
    public deleteBus(busId: string) {
        this.showLoading().then(() => {
            Api.deleteBus(busId, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status) {
                            this.updated = true;
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
                            this.updated = true;
                            this.loadBusView();
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
                            this.updated = true;
                            this.loadBusView();
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


    async dismiss() {
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(this.updated);
    }
}
