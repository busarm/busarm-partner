import { Injectable } from "@angular/core";
import { Animation, AnimationController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  constructor(private animationCtrl: AnimationController) {}

  /**
   * Fade in animation
   * @param {Number} duration
   * @param {Element} element
   * @returns {Animation}
   */
  public fadeIn(element: Element, duration: number = 200): Animation {
    return this.animationCtrl
      .create()
      .addElement(element)
      .easing("ease-in")
      .duration(duration)
      .beforeStyles({ transform: "none" })
      .fromTo("opacity", 0, 1);
  }

  /**
   * Fade out animation
   * @param {Number} duration
   * @param {Element} element
   * @returns {Animation}
   */
  public fadeout(element: Element, duration: number = 200): Animation {
    return this.animationCtrl
      .create()
      .addElement(element)
      .easing("ease-out")
      .duration(duration)
      .fromTo("opacity", 1, 0);
  }

  /**
   * Modal Zoom in  Enter Animation
   * @param {Number} duration
   * @param {Element} element
   * @returns {Animation}
   */
  public modalZoomInEnterAnimation(element: Element, duration: number = 200): Animation {
    const root = element.shadowRoot;
    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector("ion-backdrop")!)
      .fromTo("opacity", "0.01", "var(--backdrop-opacity)");

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector(".modal-wrapper")!)
      .keyframes([
        { offset: 0, opacity: "0", transform: "scale(0)" },
        { offset: 1, opacity: "0.99", transform: "scale(1)" },
      ]);

    return this.animationCtrl
      .create()
      .addElement(element)
      .easing("ease-in-out")
      .duration(duration)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  /**
   * Modal Zoom out Leave Animation
   * @param {Number} duration
   * @param {Element} element
   * @returns {Animation}
   */
  public modalZoomOutLeaveAnimation(element: Element, duration: number = 200): Animation {
    return this.modalZoomInEnterAnimation(element, duration).direction("reverse");
  }
}
