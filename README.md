# 📦 DragBox

Easily add a **drag and drop** field to your app!

## Installation

### HTML

```html
<div class="dragbox"></div>
```

### JavaScript

```js
const DragBox = require('dragbox');

new DragBox('.dragbox');
```

## Parameters

| Name                 | Description                                                              | Type              | Default                                |
| -------------------- | ------------------------------------------------------------------------ | ----------------- | -------------------------------------- |
| `element`            | Element or selector                                                      | Element or String | *(Required)*                           |
| `options`            | Options                                                                  | Object            | `{}`                                   |
| `options.accept`     | List of accepted mime types                                              | String or Array   | `[]`                                   |
| `options.maxFiles`   | Maximum number of files to accept. Setting to 1 makes preview different. | Integer           | `Infinity`                             |
| `options.textDrag`   | Text for drag and drop hint                                              | String            | `'Drag and drop here'`                 |
| `options.textOr`     | Text for "or"                                                            | String            | `'or'`                                 |
| `options.textSelect` | Text for file select button                                              | String            | `'Browse files'`                       |
| `options.iconFile`   | Icon HTML for file                                                       | HTML              | `'<i class="fa-regular fa-file"></i>'` |
| `options.iconRemove` | Icon HTML for remove button                                              | HTML              | `'<i class="fa-solid fa-xmark"></i>'`  |
| `options.onAdd`      | Callback when files are added                                            | Function          | `()=>{}`                               |
| `options.onRemove`   | Callback when files are removed                                          | Function          | `()=>{}`                               |
| `options.inputName`  | Name of input element                                                    | String            | `null`                                 |

## Styling

There is a default CSS file. You can import it by using this on your `<head>` element.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dragbox/index.css">
```

The primary color is the `--color` variable. You can change it using one of these methods:

```html
<div class="dragbox" style="--color: blueviolet">
```
```css
.dragbox {
    --color: blueviolet;
}
```