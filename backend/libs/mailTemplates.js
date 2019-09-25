function defaultMailTemplate(title, text, buttonText, buttonLink) {
  const headerStyles = `
    margin-bottom: 10px;
  `;
  const textStyles = `
    margin: 10px 0 20px;
  `;
  const buttonStyles = `
    background-color: #7012e5;
    margin-left: auto;
    margin-right: auto;
    display: -webkit-box;
    display: -ms-flexbox;
    display: inline-flex;
    padding: 8px 38px;
    font-weight: 600;
    border-radius: 26px;
    font-size: 14px;
    color: #fff;
    line-height: initial;
    text-decoration: none;
  `;
  return `
    <h1 style="${headerStyles}">${title}</h1>
    <div style="${textStyles}">${text}<div>
      <a 
        style="${buttonStyles}" 
        target="_blank" 
        href="${buttonLink}">${buttonText}</a>
    </div>
  `;
}

module.exports = {
  defaultMailTemplate
};
