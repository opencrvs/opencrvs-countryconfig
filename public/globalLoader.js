/** 
 * File For Global Loader
 */
const MAIN_LOADER_ID = "main-loader";
class GlobalLoader {
    static counter = 0;
    static showLoader() {
        this.counter++;

        if (GlobalLoader.counter >= 1) {
            const loader = document.getElementById(MAIN_LOADER_ID);
            if (loader) {
                loader.classList.remove('!hidden');
            }
        }
    }

    static hideLoader() {
        GlobalLoader.counter--;
        if (GlobalLoader.counter <= 0) {
            const loader = document.getElementById(MAIN_LOADER_ID);
            if (loader) {
                loader.classList.add('!hidden');
            }
            if (GlobalLoader.counter < 0) {
                GlobalLoader.counter = 0;
            }
        }
    }
}
export default GlobalLoader;

