const calculatePostTime = (date, nowDate) => {
    let timeDiff = nowDate.getTime() - date.dateInMs;

    let secs = Math.floor(timeDiff / 1000);
    let mins = Math.floor(timeDiff / 1000 / 60);
    let hours = Math.floor(timeDiff / 1000 / 60 / 60);
    let days = Math.floor(timeDiff / 1000 / 60 / 60 / 24);
    let months = nowDate.getMonth() - date.month;
    let years = nowDate.getFullYear() - date.year;

    if(years >= 1) {
      if(years == 1) return `hace ${years} año`;
      if(years > 1) return `hace ${years} años`;

    } else if(months >= 1) {
      if(months == 1) return `hace ${months} mes`;
      if(months > 1) return `hace ${months} mesesday`;

    } else if (days >= 1) {
      if(days == 1) return `hace ${days} día`;
      if(days > 1) return `hace ${days} días`;

    } else if (hours >= 1) {
      if(hours == 1) return `hace ${hours} hora`;
      if(hours > 1) return `hace ${hours} horas`;

    } else if (mins >= 1) {
      if(mins == 1) return `hace ${mins} minuto`;
      if(mins > 1) return `hace ${mins} minutos`;

    } else {
      if(secs == 1) return `hace ${secs} segundo`;
      if(secs > 1) return `hace ${secs} segundos`;
    }
}

export default calculatePostTime;