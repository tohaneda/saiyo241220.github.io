document.addEventListener('DOMContentLoaded', function() {
    const buttonsContainer = document.querySelector('.faq-buttons');
    const container = document.querySelector('.container');
    
    // 最初に全てのFAQセクションを作成
    Object.entries(CONFIG).forEach(([key, section]) => {
        const faqSection = createFaqSection(section);
        faqSection.id = `faq-section-${key}`; // スクロール用のID追加
        container.appendChild(faqSection);
    });
    
    // ボタンの生成とイベントの設定
    Object.entries(CONFIG).forEach(([key, section], index) => {
        const frameNumber = 7040 + index;
        
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.position = 'relative';
        
        const button = document.createElement('button');
        button.className = 'faq-button';
        button.innerHTML = '<object type="image/svg+xml" data="' + section.icon + '">' + section.title + '</object>' + section.title + '<i class="arrow"></i>';
        button.setAttribute('data-section', key);
        
        /*const frameLabel = document.createElement('div');
        frameLabel.className = 'frame-number';
         frameLabel.textContent = `Frame ${frameNumber}`;*/
        
        buttonWrapper.appendChild(button);
        //buttonWrapper.appendChild(frameLabel);
        buttonsContainer.appendChild(buttonWrapper);
        
        // クリックイベントの追加
        button.addEventListener('click', () => {
            // 該当セクションまでスムーズスクロール
            document.getElementById(`faq-section-${key}`).scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
});

// FAQセクションを作成する関数
function createFaqSection(section) {
    const faqSection = document.createElement('div');
    faqSection.className = 'faq-section';
    
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'title-wrapper';
    
    const title = document.createElement('h2');
    title.className = 'faq-title';
    let tempElement = document.createElement('div');
    tempElement.innerHTML = section.title;

    // テキストのみを取得して設定
    title.innerHTML = '<object class="icon" type="image/svg+xml" data="' + section.icon_w + '">' + section.title + '</object>' + tempElement.textContent;
    
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    titleWrapper.appendChild(title);
    titleWrapper.appendChild(backToTop);
    faqSection.appendChild(titleWrapper);

    section.faq.forEach(faq => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';

        const question = document.createElement('div');
        question.className = 'question';
        question.innerHTML = `<i class="arrow"></i> ${faq.question}`;
        
        const answer = document.createElement('div');
        answer.className = 'answer';
        answer.textContent = faq.answer;
        answer.style.display = 'none';

        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            answer.style.display = isOpen ? 'none' : 'block';
            question.querySelector('i').className = isOpen ? 
                'arrow' : 'arrow up';
        });

        faqItem.appendChild(question);
        faqItem.appendChild(answer);
        faqSection.appendChild(faqItem);
    });

    return faqSection;
}