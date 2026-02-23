package com.statify.backend.parser;

import java.io.InputStream;
import java.util.List;

public interface FileParser {
    boolean supports(String fileExtension);

    List<ParsedTransaction> parse(InputStream inputStream);
}
