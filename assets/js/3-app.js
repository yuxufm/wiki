function openSideBar(open) {
    if (open === 'open') {
        $('#sidebar').show()
        $('#header-menu').hide()
        $('#wrapper-header-content').addClass('ml-48')
    } else if (open === 'close') {
        $('#sidebar').hide()
        $('#header-menu').show()
        $('#wrapper-header-content').removeClass('ml-48')
    }
}

function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
    } else {
        false
    }
}

$(document).ready(async function () {

    // main
    main()

    async function main() {
        // get API data
        const JSON_DATA = await getData()

        // generate data to content
        await generateContent(JSON_DATA)
        await generateSidebarMenu()

        generateAutoHideNav()

        // generate ads
        if (WIKI_GENERATE_ADS == true) {
            generateAds()
        }
    }

    // generate ads before H2
    function generateAds() {
        const ads = "<div class='bg-gray-200 mt-8 p-5'>ads here</div>"
        $(ads).insertBefore($("#content h2"))
    }
    // end of generate ads



    // ------- API ------- 
    async function getData() {
        const pathNameArray = window.location.href.split('/')
        let get3BehindPathName = []
        pathNameArray.map((e, idx) => {
            if (idx >= (pathNameArray.length - 3)) {
                get3BehindPathName.push(e)
            }
        })
        get3BehindPathName = '/' + get3BehindPathName.join('/')
        const url = WIKI_BASE_URL_API + get3BehindPathName + '.json'
        // const url = 'http://192.168.0.161:3000/data' // dev only
        try {
            const res = await fetch(url)
            const resJSON = await res.json()
            return resJSON
        } catch (error) {
            window.location = "404.html"
        }
    }
    // ------- end of API ------- 



    function generateAutoHideNav() {
        /* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
        let prevScrollpos = window.pageYOffset;
        window.onscroll = function () {
            let currentScrollPos = window.pageYOffset;
            if (prevScrollpos > currentScrollPos) {
                document.getElementById("nav").style.top = "0";
            } else if (prevScrollpos > 100) {
                document.getElementById("nav").style.top = "-50px";
            }
            prevScrollpos = currentScrollPos;
        }
    }

    // if mobile phone, close the sidebar by default
    if (isMobile() === true) {
        openSideBar('close')
    } else {
        openSideBar('open')
    }

    function generateContent(json) {
        $('#content #article-title').html(json.title)
        $('#content #article').html(json.article)
        $('#content #credits').html(json.credits)

        // clear inline style & class
        $('#content [style]').removeAttr('style')
        $('#content #article [class]').removeAttr('class')
        $('#content #article-title [class]').removeAttr('class')
        $('#content #article-image [class]').removeAttr('class')
        $('#content #credits [class]').removeAttr('class')

        // if image url available, show the image
        if (json.image_url) {
            $('#content #article-image').removeClass('hidden')
            $('#content #article-image').attr('src', json.image_url)
        }
    }
    function getText(dom) {
        return $(dom).text()
    }

    function getId(dom) {
        return $(dom).attr('id')
    }

    function addId(dom) {
        const id = getText(dom).replace(/[\W_]+/g, '') // remove all non alphanumeric
        $(dom).attr('id', id)
    }

    function generateSidebarTitle() {
        const url = window.location.pathname
        if (isMobile() === true) {
            $('#link-title-sidebar').attr('onclick', " openSideBar('close')")
        }
        $('#link-title-sidebar').attr('href', url + '#')
        $('#title-sidebar').html($('#article-title').text())
    }

    function generateSidebarMenu() {
        generateSidebarTitle()

        let menu = []
        // set up H1
        const listH1 = $('#content h2').toArray()
        listH1.map(DOMH1 => {
            addId(DOMH1)
            menu.push({
                h1Text: getText(DOMH1),
                h1Id: getId(DOMH1)
            })
        })

        // set up H2
        listH1.map((DOMH1, indexH1) => {
            menu[indexH1].subMenu = []
            const listH2 = $('#' + getId(DOMH1)).nextUntil('h2', 'h3').toArray() // after H2, collect H2 list and stop until H3
            listH2.map(DOMH2 => {
                addId(DOMH2)
                menu[indexH1].subMenu.push({
                    h2Text: getText(DOMH2),
                    h2Id: getId(DOMH2)
                })
            })
        })
        setSidebarMenuDOM(menu)
    }

    function setSidebarMenuDOM(menu = []) {
        const url = window.location.pathname
        let openSideBarFunc = ''
        let sideMenuDOM = ''
        sideMenuDOM = `<ul>`
        //  if mobile, give hide function
        if (isMobile() === true) {
            openSideBarFunc = `onclick="openSideBar('close')"`
        }

        menu.map(parentMenu => {
            if (parentMenu.subMenu.length === 0) {
                let parentMenuDOM = `<li><a ${openSideBarFunc} class="transition px-3 py-1 border-b border-b-stone-400 block hover:bg-stone-700" href="${url}#${parentMenu.h1Id}">${parentMenu.h1Text}</a></li>`
                sideMenuDOM += parentMenuDOM
            } else {
                let parentAndSubMenuDOM = `<li><a ${openSideBarFunc} class="transition px-3 py-1 border-b border-b-stone-400 block hover:bg-stone-700" href="${url}#${parentMenu.h1Id}">${parentMenu.h1Text}</a>`
                let subMenuDOM = `<ul class="text-sm border-b border-b-stone-400">`
                parentMenu.subMenu.map(subMenu => {
                    subMenuDOM += `<li><a ${openSideBarFunc} class="transition text-stone-300 px-3 py-1 hover:bg-stone-700 block" href="${url}#${subMenu.h2Id}">${subMenu.h2Text}</a></li>`
                })
                subMenuDOM += `</ul>`
                parentAndSubMenuDOM += subMenuDOM + `</li>`
                sideMenuDOM += parentAndSubMenuDOM
            }
        })
        sideMenuDOM += `</ul>`
        $('#sidebar-menu').html(sideMenuDOM)
    }
})