
class DragBox extends EventTarget {

    /** @type {File[]} */ files;
    /** @type {HTMLDivElement} */ #element;
    /** @type {HTMLInputElement} */ input;

    /** @type {string[]} */ #accept;
    get accept(){ return this.#accept }
    /** @param {string|string[]} */
    set accept(accept){
        if(typeof accept == 'string'){
            if(accept == '') accept = [];
            else accept = accept.split(',');
        }
        this.input.accept = accept.join(',');
        this.#accept = accept;
    }

    /** @type {number} */ #maxFiles;
    get maxFiles(){ return this.#maxFiles }
    /** @param {string|string[]} */
    set maxFiles(maxFiles){
        this.input.multiple = maxFiles > 1;
        this.#maxFiles = maxFiles;
    }

    /** @type {string} */ #iconFile;
    /** @type {string} */ #iconRemove;

    /** @type {Function} */ #onAdd;
    /** @type {Function} */ #onRemove;

    /** @type {string[]} */ #objectURLs;

    /**
     * DragBox
     * 
     * @param {Element|string} element Element or selector
     * 
     * @param {Object} param1 Options
     * 
     * @param {string|string[]|null} param1.accept List of accepted mime types
     * @param {number?} param1.maxFiles Maximum number of files to accept. Setting to 1 makes preview different.
     * 
     * @param {string?} param1.textDrag Text for drag and drop hint
     * @param {string?} param1.textOr Text for "or"
     * @param {string?} param1.textSelect Text for file select button
     * 
     * @param {string?} param1.iconFile Icon HTML for file
     * @param {string?} param1.iconRemove Icon HTML for remove button
     * 
     * @param {Function?} param1.onAdd Callback when files are added
     * @param {Function?} param1.onRemove Callback when files are removed
     */
    constructor(element, {

        accept = [],
        maxFiles = Infinity,

        textDrag = 'Drag and drop here',
        textOr = 'or',
        textSelect = 'Browse files',

        iconFile = '<i class="fa-regular fa-file"></i>',
        iconRemove = '<i class="fa-solid fa-xmark"></i>',

        onAdd = ()=>{},
        onRemove = ()=>{},

    } = {}){
        super();

        // --- ELEMENT ---

        this.#element = typeof element == 'string' ? document.querySelector(element) : element;
        this.#element.classList.add('dragbox');
        this.#element.addEventListener('click', this.#click.bind(this));
        this.#element.innerHTML = '';

        // --- Empty ---

        const $empty = document.createElement('div');
        $empty.classList.add('empty');
        
            // --- Drag ---

            const $hintDrag = document.createElement('div');
            $hintDrag.classList.add('hint-drag');
            $hintDrag.innerText = textDrag;
            $empty.appendChild($hintDrag);

            // --- Or ---

            const $hintOr = document.createElement('div');
            $hintOr.classList.add('hint-or');
            $hintOr.innerText = textOr;
            $empty.appendChild($hintOr);

            // --- Select ---

            const $selectButton = document.createElement('button');
            $selectButton.type = 'button';
            $selectButton.classList.add('select-button');
            $selectButton.innerText = textSelect;
            $empty.appendChild($selectButton);

        this.#element.appendChild($empty);

        // --- FILES ---

        this.files = [];
        const $files = document.createElement('div');
        $files.classList.add('files');
        $files.style.display = 'none';
        this.#element.appendChild($files);

        // --- INPUT ---

        this.input = document.createElement('input');
        this.input.type = 'file';
        this.accept = accept;
        this.maxFiles = maxFiles;
        this.input.addEventListener('change', this.#change.bind(this));
        this.input.style.display = 'none';
        this.#element.appendChild(this.input);

        // --- DRAG & DROP ---

        this.#element.addEventListener('dragover', this.#dragOver.bind(this));
        this.#element.addEventListener('drop', this.#drop.bind(this));

        // --- OPTIONS ---

        this.#iconFile = iconFile;
        this.#iconRemove = iconRemove;

        this.#onAdd = onAdd;
        this.#onRemove = onRemove;

        this.#objectURLs = [];

    }

    #click(){
        if(this.files.length < this.maxFiles)
            this.input.click();
    }

    #change(){
        const files = Array.from(this.input.files);
        this.addFiles(files);
        this.input.value = null;
    }

    /** @param {DragEvent} e */
    #dragOver(e){
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    /** @param {DragEvent} e */
    #drop(e){
        e.stopPropagation();
        e.preventDefault();

        /** @type {File[]} */
        const files = e.dataTransfer.items
                      ? Array.from(e.dataTransfer.items).map(i=>i.getAsFile())
                      : e.dataTransfer.files;
        
        this.addFiles(files);

    }

    /** @param {File[]} files */
    addFiles(files){

        if(this.maxFiles == 1) this.files = [];
        files.splice(this.maxFiles - this.files.length);
        if(files.length == 0) return;

        this.files.push(...files);
        this.#onAdd(files);
        this.dispatchEvent(new CustomEvent('add', { detail: { files} }))
        this.#render();
    }    

    /** @param {File} file */
    addFile(file){
        this.addFiles([file]);
    }

    #render(){

        const isEmpty = this.files.length == 0;

        const $empty = this.#element.querySelector('.empty');
        const $files = this.#element.querySelector('.files');

        this.#element.style.cursor = this.files.length == this.maxFiles ? 'auto' : '';

        $empty.style.display = isEmpty ? '' : 'none';
        $files.style.display = isEmpty ? 'none' : '';
        
        for(let url of this.#objectURLs) URL.revokeObjectURL(url);
        this.#objectURLs = [];

        $files.innerHTML = '';
        $files.classList.toggle('single', this.files.length == 1 && this.maxFiles == 1);
        for(let i in this.files){

            const file = this.files[i];
            const isImage = file.type.startsWith('image/');

            const url = URL.createObjectURL(file);
            this.#objectURLs.push(url);
            
            const $file = document.createElement('div');
            $file.classList.add('file');
            $file.addEventListener('click', e=>e.stopPropagation());

                // --- Thumbnail ---
                const $thumbnail = document.createElement('div');
                $thumbnail.classList.add('thumbnail');
                if(isImage) $thumbnail.style.backgroundImage = `url(${url})`;
                else $thumbnail.innerHTML = this.#iconFile;
                $file.appendChild($thumbnail);

                // --- Info ---

                const $info = document.createElement('div');
                $info.classList.add('info');

                    // --- Name ---

                    const $name = document.createElement('div');
                    $name.classList.add('name');
                    $name.innerText = file.name;
                    $info.appendChild($name);

                    // --- Size ---

                    const $size = document.createElement('div');
                    $size.classList.add('size');
                    $size.innerText = this.#formatSize(file.size);
                    $info.appendChild($size);

                $file.appendChild($info);

                // --- Remove ---

                const $remove = document.createElement('button');
                $remove.classList.add('remove');
                $remove.innerHTML = this.#iconRemove;
                $remove.addEventListener('click', this.removeFile.bind(this, i));
                $file.appendChild($remove);

            $files.appendChild($file);

        }

    }

    #formatSize(size){
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        var i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + units[i];
    }

    removeFile(i){
        this.#onRemove(this.files[i]);
        this.dispatchEvent(new CustomEvent('remove', { detail: { files: this.files[i] } }))
        this.files.splice(i, 1);
        this.#render();
    }

}
module.exports = DragBox;