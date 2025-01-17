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
        button.textContent = section.title;
        button.setAttribute('data-section', key);
        
        const frameLabel = document.createElement('div');
        frameLabel.className = 'frame-number';
        // frameLabel.textContent = `Frame ${frameNumber}`;
        
        buttonWrapper.appendChild(button);
        buttonWrapper.appendChild(frameLabel);
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
    title.textContent = section.title;
    
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
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
        question.innerHTML = `<i class="fas fa-chevron-down"></i> ${faq.question}`;
        
        const answer = document.createElement('div');
        answer.className = 'answer';
        const paragraphs = faq.answer.split('\n').map(text => 
            `<p>${text}</p>`
        ).join('');
        answer.innerHTML = paragraphs;
        
        // 質問クリックで回答を表示/非表示
        question.addEventListener('click', () => {
            answer.classList.toggle('is-open');            
            question.querySelector('i').className = answer.classList.contains('is-open') ? 
                'fas fa-chevron-up' : 'fas fa-chevron-down';
        });

        faqItem.appendChild(question);
        faqItem.appendChild(answer);
        faqSection.appendChild(faqItem);
    });

    return faqSection;
}