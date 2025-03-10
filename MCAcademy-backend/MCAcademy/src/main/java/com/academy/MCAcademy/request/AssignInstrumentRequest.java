package com.academy.MCAcademy.request;

import com.academy.MCAcademy.entity.Instrument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignInstrumentRequest {

    private Instrument instrument;
}
