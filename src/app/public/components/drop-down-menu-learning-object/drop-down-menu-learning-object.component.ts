import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';

@Component({
  selector: 'app-drop-down-menu-learning-object',
  templateUrl: './drop-down-menu-learning-object.component.html',
  styleUrls: ['./drop-down-menu-learning-object.component.scss'],
  standalone: true,
  imports: [ButtonModule, CommonModule]
})
export class DropDownMenuLearningObjectComponent implements OnInit {
  public objectCollectionMenu: {
    title: string,
    items: any
  };
  private itemsStructure = [];
  @Input() object: ObjectLearning;

  private containUrlName: string = '';

  ngOnInit(): void {
    this.createDropdownMenu();
  }

  private createDropdownMenu() {
    const splitReplaceUrl = (this.object.learning_object_file.url).split('/');
    const lenSplitReplaceUrl : number = splitReplaceUrl.length;
    this.containUrlName = splitReplaceUrl[lenSplitReplaceUrl-1];
    const url_index = (this.object.learning_object_file.url).replace(this.containUrlName, 'imsmanifest.xml')
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", url_index, false);
    xmlhttp.send();

    // Obtenemos un objeto XMLDocument con el contenido del archivo xml del servidor
    let xmlDoc = xmlhttp.responseXML;

    // Obtenemos todos los nodos denominados foro del archivo xml
    var foros = xmlDoc.getElementsByTagName("organizations");
    var organization = foros[0].getElementsByTagName('organization')
    let title = organization[0].getElementsByTagName('title');
    let items = organization[0].querySelector('item');
    let jerarquia = this.obtainItemValues(items);

    this.objectCollectionMenu = {
      title: title[0].textContent,
      items: jerarquia
    }
    this.showingManagement();


      this.itemsStructure.forEach((item) => {
        let title = document.getElementById(item.title);
        //identifier
        let structure = xmlDoc.querySelectorAll('resource[identifier="' + item.id + '"]');
        const identifier = structure[0].getElementsByTagName('file')[0].getAttribute('href')

        if (title.textContent != null && title.textContent != "") { 
          title.onclick = () => {
            this.object.learning_object_file.url = (this.object.learning_object_file.url).replace(this.containUrlName, identifier);
            this.containUrlName = identifier;
          }
          title.addEventListener("keydown",(e)=>{ e.key === "Enter"?(
            this.object.learning_object_file.url = (this.object.learning_object_file.url).replace(this.containUrlName, identifier),
            this.containUrlName = identifier
          ):''})
        }
      });
  }

  private obtainItemValues(item) {
    let titleItem = item.querySelector('title');
    const tituloText = titleItem ? titleItem.textContent : '';

   
    let listaHTML = `<li><a id="${tituloText}" tabindex="0" class="link-ref">${tituloText}`;
    // Recorrer los hijos del elemento actual y agregarlos como elementos anidados
    tituloText != '' ? this.itemsStructure.push({ title: tituloText, id: item.getAttribute('identifierref') }) : '';
    const hijos = item.children;
    if (hijos.length > 0) {
      listaHTML += '<ul>';
      for (let i = 0; i < hijos.length; i++) {
        let newItem = this.obtainItemValues(hijos[i]);
        if (newItem != undefined) {
          listaHTML += newItem;
        }
      }
      listaHTML += '</ul>';
      // Cerrar el elemento de lista actual
      listaHTML += '</a></li>';
      return listaHTML;
    }
  }

  private showingManagement() {
    // Mostrar la jerarquía en un elemento HTML (por ejemplo, un div con id "jerarquia-container")
    const jerarquiaContainer = document.getElementById('jerarquia-container');
    if (jerarquiaContainer) {
      jerarquiaContainer.innerHTML = `<ul>${this.objectCollectionMenu.items}</ul>`;
    }

  }
}
